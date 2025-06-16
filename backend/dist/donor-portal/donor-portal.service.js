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
var DonorPortalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonorPortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DonorPortalService = DonorPortalService_1 = class DonorPortalService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DonorPortalService_1.name);
    }
    async findOrCreateDonorProfile(email) {
        try {
            let donorProfile = await this.prisma.donorProfile.findUnique({
                where: { email }
            });
            if (!donorProfile) {
                donorProfile = await this.prisma.donorProfile.create({
                    data: {
                        email,
                        cognitoId: `temp_${Date.now()}`,
                        firstName: '',
                        lastName: '',
                    }
                });
                this.logger.log(`Nouveau profil donateur créé pour ${email}`);
            }
            return this.mapToDto(donorProfile);
        }
        catch (error) {
            this.logger.error(`Erreur findOrCreateDonorProfile pour ${email}:`, error);
            throw error;
        }
    }
    async createDonorProfile(data) {
        try {
            const donorProfile = await this.prisma.donorProfile.create({
                data: {
                    email: data.email,
                    cognitoId: data.cognitoId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone
                }
            });
            this.logger.log(`Profil donateur créé: ${donorProfile.id}`);
            return this.mapToDto(donorProfile);
        }
        catch (error) {
            this.logger.error('Erreur createDonorProfile:', error);
            throw error;
        }
    }
    async updateDonorProfile(email, data) {
        try {
            const donorProfile = await this.prisma.donorProfile.update({
                where: { email },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    preferredCurrency: data.preferredCurrency,
                    communicationPrefs: data.communicationPrefs
                }
            });
            this.logger.log(`Profil donateur mis à jour: ${donorProfile.id}`);
            return this.mapToDto(donorProfile);
        }
        catch (error) {
            this.logger.error(`Erreur updateDonorProfile pour ${email}:`, error);
            throw error;
        }
    }
    async getDonorHistory(donorProfileId, query) {
        try {
            const { page = 1, limit = 20, startDate, endDate, tenantId, source } = query;
            const skip = (page - 1) * limit;
            const where = {};
            const donorProfile = await this.prisma.donorProfile.findUnique({
                where: { id: donorProfileId }
            });
            if (!donorProfile) {
                throw new common_1.NotFoundException('Profil donateur non trouvé');
            }
            const users = await this.prisma.user.findMany({
                where: { email: donorProfile.email }
            });
            const userIds = users.map(u => u.id);
            where.userId = { in: userIds };
            if (startDate) {
                where.createdAt = { gte: new Date(startDate) };
            }
            if (endDate) {
                where.createdAt = {
                    ...where.createdAt,
                    lte: new Date(endDate)
                };
            }
            if (tenantId) {
                where.tenantId = tenantId;
            }
            if (source) {
                where.source = source;
            }
            const [donations, total] = await Promise.all([
                this.prisma.donation.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        tenant: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        },
                        campaign: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }),
                this.prisma.donation.count({ where })
            ]);
            const stats = await this.calculatePeriodStats(userIds, startDate, endDate, tenantId, source);
            const pages = Math.ceil(total / limit);
            return {
                donations: donations.map(donation => ({
                    id: donation.id,
                    amount: donation.amount.toNumber(),
                    currency: donation.currency,
                    source: donation.source,
                    createdAt: donation.createdAt,
                    tenant: donation.tenant,
                    campaign: donation.campaign || undefined,
                    purpose: donation.purpose,
                    status: donation.status
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                },
                stats
            };
        }
        catch (error) {
            this.logger.error(`Erreur getDonorHistory pour ${donorProfileId}:`, error);
            throw error;
        }
    }
    async getFavoriteAssociations(donorProfileId) {
        try {
            const tenantAccess = await this.prisma.tenantDonorAccess.findMany({
                where: {
                    donorProfileId,
                    isFavorite: true,
                    isActive: true
                },
                include: {
                    donorProfile: true
                }
            });
            const tenantIds = tenantAccess.map(ta => ta.tenantId);
            const associations = await this.prisma.associationListing.findMany({
                where: {
                    tenantId: { in: tenantIds }
                },
                include: {
                    tenant: true
                }
            });
            return associations.map(assoc => {
                const access = tenantAccess.find(ta => ta.tenantId === assoc.tenantId);
                return {
                    ...assoc,
                    donorStats: {
                        totalDonated: access?.totalAmount?.toNumber() || 0,
                        donationsCount: access?.totalDonations || 0,
                        lastDonationAt: access?.lastDonationAt
                    }
                };
            });
        }
        catch (error) {
            this.logger.error(`Erreur getFavoriteAssociations pour ${donorProfileId}:`, error);
            throw error;
        }
    }
    async toggleFavoriteAssociation(donorProfileId, tenantId, action) {
        try {
            const isFavorite = action === 'add';
            const tenantDonorAccess = await this.prisma.tenantDonorAccess.upsert({
                where: {
                    donorProfileId_tenantId: {
                        donorProfileId,
                        tenantId
                    }
                },
                update: {
                    isFavorite
                },
                create: {
                    donorProfileId,
                    tenantId,
                    isFavorite,
                    isActive: true
                }
            });
            this.logger.log(`Association ${tenantId} ${action} favoris pour donateur ${donorProfileId}`);
            return tenantDonorAccess;
        }
        catch (error) {
            this.logger.error(`Erreur toggleFavoriteAssociation:`, error);
            throw error;
        }
    }
    async getDonorStats(donorProfileId) {
        try {
            const donorProfile = await this.prisma.donorProfile.findUnique({
                where: { id: donorProfileId }
            });
            if (!donorProfile) {
                throw new common_1.NotFoundException('Profil donateur non trouvé');
            }
            const users = await this.prisma.user.findMany({
                where: { email: donorProfile.email }
            });
            const userIds = users.map(u => u.id);
            const globalStats = await this.calculateGlobalStats(userIds);
            const sourceStats = await this.calculateStatsBySource(userIds);
            const favoriteAssociations = await this.getFavoriteAssociationsWithStats(donorProfileId);
            const monthlyTrend = await this.calculateMonthlyTrend(userIds);
            return {
                global: globalStats,
                bySources: sourceStats,
                favoriteAssociations,
                monthlyTrend
            };
        }
        catch (error) {
            this.logger.error(`Erreur getDonorStats pour ${donorProfileId}:`, error);
            throw error;
        }
    }
    mapToDto(donorProfile) {
        return {
            id: donorProfile.id,
            email: donorProfile.email,
            cognitoId: donorProfile.cognitoId,
            firstName: donorProfile.firstName,
            lastName: donorProfile.lastName,
            phone: donorProfile.phone,
            totalDonations: donorProfile.totalDonations,
            totalAmount: donorProfile.totalAmount.toNumber(),
            preferredCurrency: donorProfile.preferredCurrency,
            favoriteAssociations: donorProfile.favoriteAssociations,
            communicationPrefs: donorProfile.communicationPrefs,
            createdAt: donorProfile.createdAt,
            updatedAt: donorProfile.updatedAt,
            lastDonationAt: donorProfile.lastDonationAt
        };
    }
    async calculatePeriodStats(userIds, startDate, endDate, tenantId, source) {
        const where = { userId: { in: userIds } };
        if (startDate)
            where.createdAt = { gte: new Date(startDate) };
        if (endDate)
            where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
        if (tenantId)
            where.tenantId = tenantId;
        if (source)
            where.source = source;
        const result = await this.prisma.donation.aggregate({
            where,
            _sum: { amount: true },
            _count: { id: true }
        });
        const associationsCount = await this.prisma.donation.findMany({
            where,
            select: { tenantId: true },
            distinct: ['tenantId']
        });
        const totalAmount = result._sum.amount?.toNumber() || 0;
        const totalDonations = result._count.id || 0;
        return {
            totalAmount,
            totalDonations,
            averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
            associationsCount: associationsCount.length
        };
    }
    async calculateGlobalStats(userIds) {
        const result = await this.prisma.donation.aggregate({
            where: { userId: { in: userIds } },
            _sum: { amount: true },
            _count: { id: true },
            _min: { createdAt: true },
            _max: { createdAt: true }
        });
        const associationsCount = await this.prisma.donation.findMany({
            where: { userId: { in: userIds } },
            select: { tenantId: true },
            distinct: ['tenantId']
        });
        const totalAmount = result._sum.amount?.toNumber() || 0;
        const totalDonations = result._count.id || 0;
        return {
            totalDonations,
            totalAmount,
            averageDonation: totalDonations > 0 ? totalAmount / totalDonations : 0,
            associationsSupported: associationsCount.length,
            firstDonationDate: result._min.createdAt,
            lastDonationDate: result._max.createdAt
        };
    }
    async calculateStatsBySource(userIds) {
        const stats = await this.prisma.donation.groupBy({
            by: ['source'],
            where: { userId: { in: userIds } },
            _sum: { amount: true },
            _count: { id: true }
        });
        const totalAmount = stats.reduce((sum, stat) => sum + (stat._sum.amount?.toNumber() || 0), 0);
        return stats.map(stat => ({
            source: stat.source,
            totalDonations: stat._count.id,
            totalAmount: stat._sum.amount?.toNumber() || 0,
            percentage: totalAmount > 0
                ? ((stat._sum.amount?.toNumber() || 0) / totalAmount) * 100
                : 0
        }));
    }
    async getFavoriteAssociationsWithStats(donorProfileId) {
        const favorites = await this.prisma.tenantDonorAccess.findMany({
            where: {
                donorProfileId,
                isFavorite: true,
                isActive: true
            }
        });
        const associations = await Promise.all(favorites.map(async (fav) => {
            const association = await this.prisma.associationListing.findUnique({
                where: { tenantId: fav.tenantId }
            });
            return {
                tenantId: fav.tenantId,
                name: association?.name || 'Association inconnue',
                totalDonated: fav.totalAmount.toNumber(),
                donationsCount: fav.totalDonations,
                lastDonationDate: fav.lastDonationAt
            };
        }));
        return associations.filter(a => a.lastDonationDate);
    }
    async calculateMonthlyTrend(userIds) {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const donations = await this.prisma.donation.findMany({
            where: {
                userId: { in: userIds },
                createdAt: { gte: twelveMonthsAgo }
            },
            select: {
                amount: true,
                createdAt: true
            }
        });
        const monthlyData = new Map();
        donations.forEach(donation => {
            const monthKey = donation.createdAt.toISOString().substring(0, 7);
            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                    totalAmount: 0,
                    donationsCount: 0
                });
            }
            const data = monthlyData.get(monthKey);
            data.totalAmount += donation.amount.toNumber();
            data.donationsCount += 1;
        });
        return Array.from(monthlyData.entries())
            .map(([month, data]) => ({
            month,
            totalAmount: data.totalAmount,
            donationsCount: data.donationsCount
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }
};
exports.DonorPortalService = DonorPortalService;
exports.DonorPortalService = DonorPortalService = DonorPortalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DonorPortalService);
//# sourceMappingURL=donor-portal.service.js.map