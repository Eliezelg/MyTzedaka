"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }
    async createTenant(createTenantDto) {
        const { adminEmail, adminFirstName, adminLastName, adminPhone, ...tenantData } = createTenantDto;
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { slug: tenantData.slug },
        });
        if (existingTenant) {
            throw new common_1.ConflictException('Un tenant avec ce slug existe déjà');
        }
        if (tenantData.domain) {
            const existingDomain = await this.prisma.tenant.findFirst({
                where: { domain: tenantData.domain },
            });
            if (existingDomain) {
                throw new common_1.ConflictException('Un tenant avec ce domaine existe déjà');
            }
        }
        let tenant = null;
        try {
            tenant = await this.prisma.tenant.create({
                data: {
                    ...tenantData,
                    status: client_1.TenantStatus.ACTIVE,
                    theme: tenantData.theme || {
                        primaryColor: '#1e40af',
                        secondaryColor: '#64748b',
                        logoUrl: null,
                        customCss: '',
                    },
                    settings: tenantData.settings || {
                        allowRegistration: true,
                        emailNotifications: true,
                        language: 'fr',
                        timezone: 'Europe/Paris',
                    },
                },
            });
            const tempPassword = this.generateTemporaryPassword();
            await this.createCognitoUser(adminEmail, tempPassword, {
                given_name: adminFirstName,
                family_name: adminLastName,
                phone_number: adminPhone,
                'custom:tenant_id': tenant.id,
                'custom:role': 'ADMIN',
            });
            await this.prisma.user.create({
                data: {
                    email: adminEmail,
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    phone: adminPhone,
                    role: 'ADMIN',
                    isActive: true,
                    tenantId: tenant.id,
                    cognitoId: adminEmail,
                },
            });
            return this.formatTenantResponse(tenant);
        }
        catch (error) {
            if (tenant) {
                await this.prisma.tenant.delete({ where: { id: tenant.id } });
            }
            throw new common_1.BadRequestException(`Erreur lors de la création du tenant: ${error.message}`);
        }
    }
    async getTenants(query) {
        const { page = 1, limit = 10, search, status } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const [tenants, total] = await Promise.all([
            this.prisma.tenant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            users: true,
                            donations: { where: { status: 'COMPLETED' } },
                            campaigns: { where: { isActive: true } },
                        },
                    },
                },
            }),
            this.prisma.tenant.count({ where }),
        ]);
        return {
            tenants: tenants.map(tenant => this.formatTenantResponse(tenant)),
            total,
        };
    }
    async getTenantById(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        donations: { where: { status: 'COMPLETED' } },
                        campaigns: { where: { isActive: true } },
                    },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant non trouvé');
        }
        return this.formatTenantResponse(tenant);
    }
    async updateTenant(id, updateTenantDto) {
        const existingTenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!existingTenant) {
            throw new common_1.NotFoundException('Tenant non trouvé');
        }
        if (updateTenantDto.domain && updateTenantDto.domain !== existingTenant.domain) {
            const existingDomain = await this.prisma.tenant.findFirst({
                where: {
                    domain: updateTenantDto.domain,
                    NOT: { id },
                },
            });
            if (existingDomain) {
                throw new common_1.ConflictException('Un tenant avec ce domaine existe déjà');
            }
        }
        const updatedTenant = await this.prisma.tenant.update({
            where: { id },
            data: updateTenantDto,
            include: {
                _count: {
                    select: {
                        users: true,
                        donations: { where: { status: 'COMPLETED' } },
                        campaigns: { where: { isActive: true } },
                    },
                },
            },
        });
        return this.formatTenantResponse(updatedTenant);
    }
    async deleteTenant(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                users: true,
                donations: true,
                campaigns: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant non trouvé');
        }
        const hasActiveData = tenant.users.length > 0 ||
            tenant.donations.length > 0 ||
            tenant.campaigns.length > 0;
        if (hasActiveData) {
            throw new common_1.BadRequestException('Impossible de supprimer un tenant avec des données actives');
        }
        await this.prisma.tenant.delete({ where: { id } });
    }
    async getAdminStats() {
        const [totalTenants, activeTenants, totalUsers, totalDonations, totalCampaigns, totalAmount, recentTenants] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count(),
            this.prisma.donation.count(),
            this.prisma.campaign.count(),
            this.prisma.donation.aggregate({
                _sum: { amount: true }
            }),
            this.prisma.tenant.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            users: true,
                            donations: true,
                            campaigns: true
                        }
                    }
                }
            })
        ]);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyStats = await this.prisma.$queryRaw `
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(CASE WHEN table_name = 'tenants' THEN 1 END)::int as tenants,
        COUNT(CASE WHEN table_name = 'users' THEN 1 END)::int as users,
        COUNT(CASE WHEN table_name = 'donations' THEN 1 END)::int as donations,
        COALESCE(SUM(CASE WHEN table_name = 'donations' THEN amount ELSE 0 END), 0) as amount
      FROM (
        SELECT 'tenants' as table_name, "createdAt", 0 as amount FROM "tenants" WHERE "createdAt" >= ${sixMonthsAgo}
        UNION ALL
        SELECT 'users' as table_name, "createdAt", 0 as amount FROM "users" WHERE "createdAt" >= ${sixMonthsAgo}
        UNION ALL
        SELECT 'donations' as table_name, "createdAt", amount FROM "donations" WHERE "createdAt" >= ${sixMonthsAgo}
      ) combined
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 6
    `;
        return {
            totalTenants,
            activeTenants,
            totalUsers,
            totalDonations,
            totalAmount: Number(totalAmount._sum.amount || 0),
            totalCampaigns,
            recentTenants: recentTenants.map(tenant => ({
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain,
                status: tenant.status,
                theme: tenant.theme,
                settings: tenant.settings,
                createdAt: tenant.createdAt,
                updatedAt: tenant.updatedAt,
                stats: {
                    users: tenant._count.users,
                    donations: tenant._count.donations,
                    campaigns: tenant._count.campaigns,
                    totalAmount: 0
                }
            })),
            monthlyStats: monthlyStats.map(stat => ({
                month: stat.month.toISOString().substring(0, 7),
                tenants: stat.tenants,
                users: stat.users,
                donations: stat.donations,
                amount: Number(stat.amount)
            }))
        };
    }
    async createCognitoUser(email, tempPassword, attributes) {
        const userPoolId = this.configService.get('AWS_COGNITO_USER_POOL_ID');
        const userAttributes = Object.entries(attributes).map(([Name, Value]) => ({
            Name,
            Value: String(Value),
        }));
        const createUserCommand = new client_cognito_identity_provider_1.AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' },
                ...userAttributes,
            ],
            TemporaryPassword: tempPassword,
            MessageAction: 'SUPPRESS',
        });
        await this.cognitoClient.send(createUserCommand);
    }
    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    formatTenantResponse(tenant) {
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain,
            status: tenant.status,
            theme: tenant.theme,
            settings: tenant.settings,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
            stats: tenant._count ? {
                users: tenant._count.users || 0,
                donations: tenant._count.donations || 0,
                campaigns: tenant._count.campaigns || 0,
                totalAmount: 0
            } : undefined
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AdminService);
//# sourceMappingURL=admin.service.js.map