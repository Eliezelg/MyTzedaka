import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { 
  CreateDonorProfileDto, 
  UpdateDonorProfileDto,
  DonorProfileDto,
  DonorHistoryQueryDto,
  DonorHistoryResponseDto,
  DonorStatsDto
} from './dto/donor-portal.dto';

@Injectable()
export class DonorPortalService {
  private readonly logger = new Logger(DonorPortalService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Trouve ou crée un profil donateur par email
   */
  async findOrCreateDonorProfile(email: string): Promise<DonorProfileDto> {
    try {
      let donorProfile = await this.prisma.donorProfile.findUnique({
        where: { email }
      });

      if (!donorProfile) {
        // Si le profil n'existe pas, on en crée un basique
        // Les vraies données seront mises à jour lors du premier don
        donorProfile = await this.prisma.donorProfile.create({
          data: {
            email,
            cognitoId: `temp_${Date.now()}`, // Temporaire
            firstName: '',
            lastName: '',
          }
        });
        
        this.logger.log(`Nouveau profil donateur créé pour ${email}`);
      }

      return this.mapToDto(donorProfile);
    } catch (error) {
      this.logger.error(`Erreur findOrCreateDonorProfile pour ${email}:`, error);
      throw error;
    }
  }

  /**
   * Crée un profil donateur
   */
  async createDonorProfile(data: CreateDonorProfileDto): Promise<DonorProfileDto> {
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
    } catch (error) {
      this.logger.error('Erreur createDonorProfile:', error);
      throw error;
    }
  }

  /**
   * Met à jour un profil donateur
   */
  async updateDonorProfile(email: string, data: UpdateDonorProfileDto): Promise<DonorProfileDto> {
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
    } catch (error) {
      this.logger.error(`Erreur updateDonorProfile pour ${email}:`, error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des dons cross-tenant d'un donateur
   */
  async getDonorHistory(
    donorProfileId: string, 
    query: DonorHistoryQueryDto
  ): Promise<DonorHistoryResponseDto> {
    try {
      const { page = 1, limit = 20, startDate, endDate, tenantId, source } = query;
      const skip = (page - 1) * limit;

      // Construction des filtres
      const where: any = {};
      
      // Trouver toutes les donations liées à ce donateur via son email
      const donorProfile = await this.prisma.donorProfile.findUnique({
        where: { id: donorProfileId }
      });

      if (!donorProfile) {
        throw new NotFoundException('Profil donateur non trouvé');
      }

      // Récupérer tous les utilisateurs avec cet email dans tous les tenants
      const users = await this.prisma.user.findMany({
        where: { email: donorProfile.email }
      });

      const userIds = users.map(u => u.id);
      
      // Debug logs
      this.logger.log(`🔍 Debug getDonorHistory pour ${donorProfile.email}:`);
      this.logger.log(`📧 Email du profil: ${donorProfile.email}`);
      this.logger.log(`👥 Utilisateurs trouvés: ${users.length}`);
      this.logger.log(`🆔 UserIds: ${JSON.stringify(userIds)}`);
      
      where.userId = { in: userIds };
      
      // Debug: Chercher aussi directement toutes les donations avec cet email
      const allDonationsForEmail = await this.prisma.donation.findMany({
        where: {
          user: {
            email: donorProfile.email
          }
        },
        include: {
          user: {
            select: { id: true, email: true, tenantId: true }
          }
        }
      });
      
      this.logger.log(`💰 Donations directes par email: ${allDonationsForEmail.length}`);
      if (allDonationsForEmail.length > 0) {
        this.logger.log(`💰 Première donation: userId=${allDonationsForEmail[0].userId}, userEmail=${allDonationsForEmail[0].user?.email}`);
      }

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

      // Récupérer les donations avec pagination
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

      // Calculer les statistiques de la période
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
    } catch (error) {
      this.logger.error(`Erreur getDonorHistory pour ${donorProfileId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les associations favorites d'un donateur
   */
  async getFavoriteAssociations(donorProfileId: string) {
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

      // Récupérer les informations complètes des associations
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
    } catch (error) {
      this.logger.error(`Erreur getFavoriteAssociations pour ${donorProfileId}:`, error);
      throw error;
    }
  }

  /**
   * Ajoute ou supprime une association des favoris
   */
  async toggleFavoriteAssociation(
    donorProfileId: string, 
    tenantId: string, 
    action: 'add' | 'remove'
  ) {
    try {
      const isFavorite = action === 'add';

      // Créer ou mettre à jour la relation
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
    } catch (error) {
      this.logger.error(`Erreur toggleFavoriteAssociation:`, error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques complètes d'un donateur
   */
  async getDonorStats(donorProfileId: string): Promise<DonorStatsDto> {
    try {
      const donorProfile = await this.prisma.donorProfile.findUnique({
        where: { id: donorProfileId }
      });

      if (!donorProfile) {
        throw new NotFoundException('Profil donateur non trouvé');
      }

      // Récupérer tous les utilisateurs avec cet email
      const users = await this.prisma.user.findMany({
        where: { email: donorProfile.email }
      });
      const userIds = users.map(u => u.id);

      // Statistiques globales
      const globalStats = await this.calculateGlobalStats(userIds);

      // Statistiques par source
      const sourceStats = await this.calculateStatsBySource(userIds);

      // Associations favorites avec stats
      const favoriteAssociations = await this.getFavoriteAssociationsWithStats(donorProfileId);

      // Tendance mensuelle (12 derniers mois)
      const monthlyTrend = await this.calculateMonthlyTrend(userIds);

      return {
        global: globalStats,
        bySources: sourceStats,
        favoriteAssociations,
        monthlyTrend
      };
    } catch (error) {
      this.logger.error(`Erreur getDonorStats pour ${donorProfileId}:`, error);
      throw error;
    }
  }

  /**
   * Synchronise les statistiques d'un profil donateur avec ses donations existantes
   */
  async syncDonorProfileStats(email: string): Promise<DonorProfileDto> {
    try {
      // Trouver ou créer le profil donateur
      let donorProfile = await this.findOrCreateDonorProfile(email);
      
      // Récupérer tous les utilisateurs avec cet email
      const users = await this.prisma.user.findMany({
        where: { email }
      });

      const userIds = users.map(u => u.id);

      // Calculer les statistiques globales
      const stats = await this.prisma.donation.aggregate({
        where: {
          userId: { in: userIds },
          status: 'COMPLETED' // Seulement les dons confirmés
        },
        _count: { id: true },
        _sum: { amount: true }
      });

      // Trouver la dernière donation
      const lastDonation = await this.prisma.donation.findFirst({
        where: {
          userId: { in: userIds },
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' }
      });

      // Mettre à jour le profil donateur
      const updatedProfile = await this.prisma.donorProfile.update({
        where: { email },
        data: {
          totalDonations: stats._count.id || 0,
          totalAmount: stats._sum.amount || 0,
          lastDonationAt: lastDonation?.createdAt || null
        }
      });

      this.logger.log(`Statistiques synchronisées pour ${email}: ${stats._count.id} dons, ${stats._sum.amount}€`);
      return this.mapToDto(updatedProfile);
    } catch (error) {
      this.logger.error(`Erreur syncDonorProfileStats pour ${email}:`, error);
      throw error;
    }
  }

  // Méthodes utilitaires privées

  private mapToDto(donorProfile: any): DonorProfileDto {
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

  private async calculatePeriodStats(
    userIds: string[], 
    startDate?: string, 
    endDate?: string,
    tenantId?: string,
    source?: string
  ) {
    const where: any = { userId: { in: userIds } };
    
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (tenantId) where.tenantId = tenantId;
    if (source) where.source = source;

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

  private async calculateGlobalStats(userIds: string[]) {
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

  private async calculateStatsBySource(userIds: string[]) {
    const stats = await this.prisma.donation.groupBy({
      by: ['source'],
      where: { userId: { in: userIds } },
      _sum: { amount: true },
      _count: { id: true }
    });

    const totalAmount = stats.reduce((sum, stat) => 
      sum + (stat._sum.amount?.toNumber() || 0), 0
    );

    return stats.map(stat => ({
      source: stat.source,
      totalDonations: stat._count.id,
      totalAmount: stat._sum.amount?.toNumber() || 0,
      percentage: totalAmount > 0 
        ? ((stat._sum.amount?.toNumber() || 0) / totalAmount) * 100 
        : 0
    }));
  }

  private async getFavoriteAssociationsWithStats(donorProfileId: string) {
    const favorites = await this.prisma.tenantDonorAccess.findMany({
      where: {
        donorProfileId,
        isFavorite: true,
        isActive: true
      }
    });

    const associations = await Promise.all(
      favorites.map(async (fav) => {
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
      })
    );

    return associations.filter(a => a.lastDonationDate); // Seulement ceux avec des dons
  }

  private async calculateMonthlyTrend(userIds: string[]) {
    // Récupérer les 12 derniers mois
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

    // Grouper par mois
    const monthlyData = new Map();
    
    donations.forEach(donation => {
      const monthKey = donation.createdAt.toISOString().substring(0, 7); // YYYY-MM
      
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

    // Convertir en array et trier
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        totalAmount: data.totalAmount,
        donationsCount: data.donationsCount
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
