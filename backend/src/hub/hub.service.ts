import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HubStatsDto, AssociationSearchDto, DonorProfileDto, CreateDonorProfileDto, RecordActivityDto } from './dto/hub.dto';

@Injectable()
export class HubService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère toutes les associations publiques pour le hub central
   */
  async getPublicAssociations(): Promise<{
    data: any[],
    total: number,
    page: number,
    limit: number,
    pages: number
  }> {
    try {
      const [data, total] = await Promise.all([
        this.prisma.associationListing.findMany({
          where: { isPublic: true },
          orderBy: [
            { isVerified: 'desc' }, // Vérifiées en premier
            { createdAt: 'desc' }
          ]
        }),
        this.prisma.associationListing.count({
          where: { isPublic: true }
        })
      ]);

      return {
        data,
        total,
        page: 1,
        limit: data.length,
        pages: 1
      };
    } catch (error) {
      // Si la table n'existe pas encore, retourner une réponse vide
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 0,
        pages: 0
      };
    }
  }

  /**
   * Récupère les statistiques globales pour le hub central
   */
  async getGlobalStats(): Promise<HubStatsDto> {
    try {
      const [
        totalAssociations,
        verifiedAssociations,
        totalCampaigns,
        activeCampaigns,
        totalDonations,
        totalAmount
      ] = await Promise.all([
        this.prisma.associationListing.count({ where: { isPublic: true } }),
        this.prisma.associationListing.count({ where: { isPublic: true, isVerified: true } }),
        this.prisma.campaign.count(),
        this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
        this.prisma.donation.count(),
        this.prisma.donation.aggregate({
          _sum: { amount: true }
        })
      ]);

      return {
        totalAssociations,
        verifiedAssociations,
        totalCampaigns,
        activeCampaigns,
        totalDonations,
        totalAmount: Number(totalAmount._sum.amount || 0)
      };
    } catch (error) {
      // Si les tables n'existent pas encore, retourner des stats vides
      return {
        totalAssociations: 0,
        verifiedAssociations: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalDonations: 0,
        totalAmount: 0
      };
    }
  }

  /**
   * Récupère les campagnes populaires cross-tenant
   */
  async getPopularCampaigns(limit: number = 10): Promise<any[]> {
    try {
      return await this.prisma.campaign.findMany({
        where: { status: 'ACTIVE', isActive: true },
        take: limit,
        orderBy: [
          { createdAt: 'desc' }
        ],
        include: {
          tenant: {
            select: {
              name: true,
              slug: true
            }
          },
          _count: {
            select: { donations: true }
          }
        }
      });
    } catch (error) {
      // Si la table n'existe pas encore, retourner un array vide
      return [];
    }
  }

  /**
   * Récupère les campagnes publiques avec pagination et filtres
   */
  async getCampaigns(query: any): Promise<{
    campaigns: any[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
      hasNext: boolean,
      hasPrev: boolean
    }
  }> {
    try {
      // Paramètres de pagination
      const page = parseInt(query.page || '1');
      const limit = Math.min(parseInt(query.limit || '12'), 50);
      const skip = (page - 1) * limit;

      // Paramètres de filtrage
      const search = query.search;
      const category = query.category;
      const status = query.status || 'ACTIVE';
      const isFeatured = query.featured === 'true';
      const isUrgent = query.urgent === 'true';

      // Construction des filtres
      const where: any = {
        isActive: true,
        isPublic: true,
        status: status,
      };

      if (isFeatured) {
        where.isFeatured = true;
      }

      if (isUrgent) {
        where.isUrgent = true;
      }

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ];
      }

      // Récupération des campagnes avec relations
      const [campaigns, total] = await Promise.all([
        this.prisma.campaign.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { isFeatured: 'desc' },
            { isUrgent: 'desc' },
            { createdAt: 'desc' }
          ],
          include: {
            tenant: {
              select: {
                name: true,
                slug: true,
                domain: true,
              }
            },
            associationListing: {
              select: {
                name: true,
                logoUrl: true,
                location: true,
                isVerified: true,
              }
            },
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            },
            _count: {
              select: {
                donations: true,
              }
            }
          }
        }),
        this.prisma.campaign.count({ where })
      ]);

      // Calcul des statistiques pour chaque campagne
      const enrichedCampaigns = campaigns.map(campaign => {
        const progressPercentage = Number(campaign.goal) > 0 
          ? Math.round((Number(campaign.raised) / Number(campaign.goal)) * 100)
          : 0;

        const daysLeft = campaign.endDate 
          ? Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : null;

        return {
          ...campaign,
          progressPercentage,
          daysLeft,
          // Formatage des montants
          raised: Number(campaign.raised),
          goal: Number(campaign.goal),
          avgDonation: Number(campaign.avgDonation),
          // Association info
          associationName: campaign.associationListing?.name || campaign.tenant.name,
          associationLogo: campaign.associationListing?.logoUrl,
          associationLocation: campaign.associationListing?.location,
          isVerifiedAssociation: campaign.associationListing?.isVerified || false,
        };
      });

      const totalPages = Math.ceil(total / limit);

      return {
        campaigns: enrichedCampaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      };

    } catch (error) {
      console.error('❌ Erreur getCampaigns:', error);
      return {
        campaigns: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      };
    }
  }

  /**
   * Récupère les détails d'une campagne
   */
  async getCampaignById(id: string): Promise<any> {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { 
          id,
          isActive: true,
          isPublic: true
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              domain: true,
            }
          },
          associationListing: {
            select: {
              id: true,
              name: true,
              description: true,
              logoUrl: true,
              location: true,
              isVerified: true,
              totalRaised: true,
              donationsCount: true,
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          donations: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              amount: true,
              currency: true,
              createdAt: true,
              // Note: ajout des infos donateur si nécessaire
            }
          },
          _count: {
            select: {
              donations: true,
            }
          }
        }
      });

      if (!campaign) {
        throw new Error('Campagne non trouvée');
      }

      // Calcul des statistiques
      const progressPercentage = Number(campaign.goal) > 0 
        ? Math.round((Number(campaign.raised) / Number(campaign.goal)) * 100)
        : 0;

      const daysLeft = campaign.endDate 
        ? Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      return {
        ...campaign,
        progressPercentage,
        daysLeft,
        // Formatage des montants
        raised: Number(campaign.raised),
        goal: Number(campaign.goal),
        avgDonation: Number(campaign.avgDonation),
        // Association info
        associationName: campaign.associationListing?.name || campaign.tenant.name,
        associationLogo: campaign.associationListing?.logoUrl,
        associationLocation: campaign.associationListing?.location,
        isVerifiedAssociation: campaign.associationListing?.isVerified || false,
        // Statistiques récentes
        recentDonations: campaign.donations.map(donation => ({
          ...donation,
          amount: Number(donation.amount),
        })),
      };

    } catch (error) {
      console.error('❌ Erreur getCampaignById:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique global d'un donateur
   */
  async getDonorGlobalHistory(donorProfileId: string): Promise<DonorProfileDto> {
    try {
      const donorProfile = await this.prisma.donorProfile.findUnique({
        where: { id: donorProfileId },
        include: {
          tenantAccess: {
            include: {
              // Note: Il faudra joindre avec la table tenant pour obtenir les noms
            }
          }
        }
      });

      if (!donorProfile) {
        throw new Error('Profil donateur non trouvé');
      }

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
        createdAt: donorProfile.createdAt,
        updatedAt: donorProfile.updatedAt,
        lastDonationAt: donorProfile.lastDonationAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Met à jour les statistiques globales d'un donateur
   */
  async updateDonorGlobalStats(donorProfileId: string): Promise<DonorProfileDto> {
    try {
      const stats = await this.prisma.tenantDonorAccess.aggregate({
        where: { donorProfileId },
        _sum: {
          totalDonations: true,
          totalAmount: true
        }
      });

      const lastDonation = await this.prisma.tenantDonorAccess.findFirst({
        where: { donorProfileId },
        orderBy: { lastDonationAt: 'desc' },
        select: { lastDonationAt: true }
      });

      const updatedProfile = await this.prisma.donorProfile.update({
        where: { id: donorProfileId },
        data: {
          totalDonations: stats._sum.totalDonations || 0,
          totalAmount: stats._sum.totalAmount || 0,
          lastDonationAt: lastDonation?.lastDonationAt,
          updatedAt: new Date()
        }
      });

      return {
        id: updatedProfile.id,
        email: updatedProfile.email,
        cognitoId: updatedProfile.cognitoId,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        totalDonations: updatedProfile.totalDonations,
        totalAmount: updatedProfile.totalAmount.toNumber(),
        preferredCurrency: updatedProfile.preferredCurrency,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt,
        lastDonationAt: updatedProfile.lastDonationAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Recherche d'associations avec pagination et tri
   */
  async searchAssociations(searchDto: AssociationSearchDto): Promise<{
    associations: any[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    try {
      // Normaliser les paramètres de recherche
      const query = searchDto.q || searchDto.query;
      const page = searchDto.page || 1;
      const limit = searchDto.limit || 12;
      const sortBy = searchDto.sortBy || 'relevance';
      
      // Construire les conditions WHERE
      const whereConditions: any = {
        isPublic: true
      };

      // Recherche par mots-clés (optionnelle maintenant)
      if (query && query.trim()) {
        whereConditions.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }

      // Filtres optionnels
      if (searchDto.category) {
        whereConditions.category = searchDto.category;
      }

      if (searchDto.location) {
        whereConditions.location = { contains: searchDto.location, mode: 'insensitive' };
      }

      if (searchDto.verified !== undefined) {
        whereConditions.isVerified = searchDto.verified;
      }

      // Construire l'ordre de tri
      let orderBy: any[] = [];
      switch (sortBy) {
        case 'name':
          orderBy = [{ name: 'asc' }];
          break;
        case 'created_at':
          orderBy = [{ createdAt: 'desc' }];
          break;
        case 'relevance':
        default:
          orderBy = [
            { isVerified: 'desc' },
            { createdAt: 'desc' }
          ];
          break;
      }

      // Calculer offset pour la pagination
      const offset = (page - 1) * limit;

      // Exécuter la requête avec pagination
      const [associations, total] = await Promise.all([
        this.prisma.associationListing.findMany({
          where: whereConditions,
          orderBy,
          skip: offset,
          take: limit
        }),
        this.prisma.associationListing.count({
          where: whereConditions
        })
      ]);

      return {
        associations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      // Si la table n'existe pas encore, retourner une réponse vide paginée
      return {
        associations: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
      };
    }
  }

  /**
   * Crée un profil donateur global
   */
  async createDonorProfile(donorData: CreateDonorProfileDto): Promise<DonorProfileDto> {
    try {
      const donorProfile = await this.prisma.donorProfile.create({
        data: {
          email: donorData.email,
          cognitoId: donorData.cognitoId,
          firstName: donorData.firstName,
          lastName: donorData.lastName,
          phone: donorData.phone
        }
      });

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
        createdAt: donorProfile.createdAt,
        updatedAt: donorProfile.updatedAt,
        lastDonationAt: donorProfile.lastDonationAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Trouve ou crée un profil donateur
   */
  async findOrCreateDonorProfile(donorData: CreateDonorProfileDto): Promise<DonorProfileDto> {
    try {
      // Chercher par email d'abord
      let donorProfile = await this.prisma.donorProfile.findUnique({
        where: { email: donorData.email }
      });

      if (!donorProfile) {
        // Créer un nouveau profil
        donorProfile = await this.prisma.donorProfile.create({
          data: {
            email: donorData.email,
            cognitoId: donorData.cognitoId,
            firstName: donorData.firstName,
            lastName: donorData.lastName,
            phone: donorData.phone
          }
        });
      }

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
        createdAt: donorProfile.createdAt,
        updatedAt: donorProfile.updatedAt,
        lastDonationAt: donorProfile.lastDonationAt
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enregistre une activité cross-tenant pour un donateur
   */
  async recordTenantActivity(donorProfileId: string, tenantId: string, activity: RecordActivityDto): Promise<any> {
    try {
      return await this.prisma.tenantDonorAccess.upsert({
        where: {
          donorProfileId_tenantId: {
            donorProfileId,
            tenantId
          }
        },
        update: {
          totalDonations: { increment: activity.donationAmount ? 1 : 0 },
          totalAmount: { increment: activity.donationAmount || 0 },
          lastDonationAt: activity.donationAmount ? new Date() : undefined,
          isFavorite: activity.isFavorite ?? undefined,
          updatedAt: new Date()
        },
        create: {
          donorProfileId,
          tenantId,
          totalDonations: activity.donationAmount ? 1 : 0,
          totalAmount: activity.donationAmount || 0,
          lastDonationAt: activity.donationAmount ? new Date() : undefined,
          isFavorite: activity.isFavorite || false
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
