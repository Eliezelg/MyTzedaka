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
}
