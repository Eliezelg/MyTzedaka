import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';
import { 
  CreateTenantDto, 
  UpdateTenantDto, 
  TenantListQueryDto, 
  TenantResponseDto, 
  AdminStatsDto 
} from './dto/admin.dto';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createTenant(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const { adminEmail, adminFirstName, adminLastName, adminPhone, ...tenantData } = createTenantDto;

    // Vérifier que le slug est unique
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantData.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Un tenant avec ce slug existe déjà');
    }

    // Vérifier que le domaine est unique (si fourni)
    if (tenantData.domain) {
      const existingDomain = await this.prisma.tenant.findFirst({
        where: { domain: tenantData.domain },
      });

      if (existingDomain) {
        throw new ConflictException('Un tenant avec ce domaine existe déjà');
      }
    }

    let tenant: any = null;

    try {
      // Créer le tenant dans la base de données
      tenant = await this.prisma.tenant.create({
        data: {
          ...tenantData,
          status: TenantStatus.ACTIVE,
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

      // Créer l'utilisateur admin dans Cognito
      const tempPassword = this.generateTemporaryPassword();
      
      await this.createCognitoUser(adminEmail, tempPassword, {
        given_name: adminFirstName,
        family_name: adminLastName,
        phone_number: adminPhone,
        'custom:tenant_id': tenant.id,
        'custom:role': 'ADMIN',
      });

      // Créer l'utilisateur admin dans la base de données
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          firstName: adminFirstName,
          lastName: adminLastName,
          phone: adminPhone,
          role: 'ADMIN',
          isActive: true,
          tenantId: tenant.id,
          cognitoId: adminEmail, // Sera mis à jour lors de la première connexion
        },
      });

      // Retourner le tenant créé avec les statistiques
      return this.formatTenantResponse(tenant);
    } catch (error) {
      // Si la création Cognito échoue, supprimer le tenant de la DB
      if (tenant) {
        await this.prisma.tenant.delete({ where: { id: tenant.id } });
      }
      throw new BadRequestException(`Erreur lors de la création du tenant: ${error.message}`);
    }
  }

  async getTenants(query: TenantListQueryDto): Promise<{ tenants: TenantResponseDto[]; total: number; }> {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

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

  async getTenantById(id: string): Promise<TenantResponseDto> {
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
      throw new NotFoundException('Tenant non trouvé');
    }

    return this.formatTenantResponse(tenant);
  }

  async updateTenant(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    // Vérifier l'unicité du domaine si modifié
    if (updateTenantDto.domain && updateTenantDto.domain !== existingTenant.domain) {
      const existingDomain = await this.prisma.tenant.findFirst({
        where: { 
          domain: updateTenantDto.domain,
          NOT: { id },
        },
      });

      if (existingDomain) {
        throw new ConflictException('Un tenant avec ce domaine existe déjà');
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

  async deleteTenant(id: string): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        donations: true,
        campaigns: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    // Vérifier qu'il n'y a pas de données actives
    const hasActiveData = tenant.users.length > 0 || 
                         tenant.donations.length > 0 || 
                         tenant.campaigns.length > 0;

    if (hasActiveData) {
      throw new BadRequestException('Impossible de supprimer un tenant avec des données actives');
    }

    await this.prisma.tenant.delete({ where: { id } });
  }

  async getAdminStats(): Promise<AdminStatsDto> {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalDonations,
      totalCampaigns,
      totalAmount,
      recentTenants
    ] = await Promise.all([
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

    // Calculer les statistiques par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await this.prisma.$queryRaw`
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
    ` as any[];

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
        theme: tenant.theme as Record<string, any>,
        settings: tenant.settings as Record<string, any>,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        stats: {
          users: tenant._count.users,
          donations: tenant._count.donations,
          campaigns: tenant._count.campaigns,
          totalAmount: 0 // À calculer si nécessaire
        }
      })),
      monthlyStats: monthlyStats.map(stat => ({
        month: stat.month.toISOString().substring(0, 7), // Format YYYY-MM
        tenants: stat.tenants,
        users: stat.users,
        donations: stat.donations,
        amount: Number(stat.amount)
      }))
    };
  }

  async createCognitoUser(email: string, tempPassword: string, attributes: Record<string, string>) {
    const userPoolId = this.configService.get('AWS_COGNITO_USER_POOL_ID');

    const userAttributes = Object.entries(attributes).map(([Name, Value]) => ({
      Name,
      Value: String(Value),
    }));

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        ...userAttributes,
      ],
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS', // Ne pas envoyer l'email avec le mot de passe temporaire
    });

    await this.cognitoClient.send(createUserCommand);
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private formatTenantResponse(tenant: any): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      status: tenant.status,
      theme: tenant.theme as Record<string, any>,
      settings: tenant.settings as Record<string, any>,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      stats: tenant._count ? {
        users: tenant._count.users || 0,
        donations: tenant._count.donations || 0,
        campaigns: tenant._count.campaigns || 0,
        totalAmount: 0 // À calculer si nécessaire
      } : undefined
    };
  }
}
