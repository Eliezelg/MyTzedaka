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
   * Récupère les détails d'une association
   */
  async getAssociationById(id: string): Promise<any> {
    try {
      const association = await this.prisma.associationListing.findUnique({
        where: { 
          id,
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
          campaigns: {
            where: {
              status: 'ACTIVE',
              isActive: true,
              isPublic: true
            },
            select: {
              id: true,
              title: true,
              description: true,
              goal: true,
              raised: true,
              status: true,
              createdAt: true,
              coverImage: true,
              isUrgent: true,
              isFeatured: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          }
        }
      });

      if (!association) {
        throw new Error('Association non trouvée');
      }

      // Enrichir les données avec des statistiques calculées
      const activeCampaignsCount = association.campaigns.length;
      const totalRaised = association.campaigns.reduce((sum, campaign) => 
        sum + Number(campaign.raised || 0), 0);

      return {
        ...association,
        // Statistiques calculées
        activeCampaignsCount,
        totalRaised,
        // Informations tenant
        tenantInfo: association.tenant,
        // Campagnes enrichies
        campaigns: association.campaigns.map(campaign => ({
          ...campaign,
          goal: Number(campaign.goal),
          raised: Number(campaign.raised),
          progressPercentage: campaign.goal ? 
            Math.round((Number(campaign.raised) / Number(campaign.goal)) * 100) : 0
        }))
      };

    } catch (error) {
      console.error('❌ Erreur getAssociationById:', error);
      throw error;
    }
  }

  /**
   * Récupère une association par le slug de son tenant
   */
  async getAssociationBySlug(slug: string): Promise<any> {
    try {
      const association = await this.prisma.associationListing.findFirst({
        where: { 
          tenant: {
            slug: slug
          }
        },
        include: {
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
            }
          },
          campaigns: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              title: true,
              description: true,
              goal: true,
              raised: true,
              status: true,
              createdAt: true,
              endDate: true,
              isActive: true,
            }
          }
        }
      });

      if (!association) {
        throw new Error('Association non trouvée');
      }

      return association;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'association par slug:', error);
      throw new Error('Impossible de récupérer l\'association');
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

  /**
   * Crée une nouvelle association avec les données progressives
   */
  async createAssociation(associationData: {
    name: string;
    description?: string;
    category?: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    website?: string;
    tenantId?: string;
    userId: string; // ID de l'utilisateur créateur
    // Données progressives additionnelles
    legalInfo?: any;
    contactInfo?: any;
    additionalInfo?: any;
  }): Promise<any> {
    try {
      // ✅ VALIDATION STRICTE : Vérifier que userId est fourni
      if (!associationData.userId || associationData.userId.trim() === '') {
        throw new Error('userId est requis pour créer une association');
      }
  
      console.log('🔍 Données reçues pour création association:', associationData);
  
      // Générer un slug unique basé sur le nom
      const baseSlug = associationData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Vérifier l'unicité du slug
      while (await this.prisma.tenant.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
  
      // Créer le tenant (structure multi-tenant)
      const tenant = await this.prisma.tenant.create({
        data: {
          slug: slug,
          name: associationData.name,
          status: 'ACTIVE'
        }
      });

      // Créer l'association liée à ce tenant avec description par défaut si manquante
      const newAssociation = await this.prisma.associationListing.create({
        data: {
          name: associationData.name,
          description: associationData.description || `Association ${associationData.name} - Description à compléter`,
          category: associationData.category || 'HUMANITAIRE',
          location: associationData.address || '',
          city: associationData.city,
          country: associationData.country || 'FR',
          email: associationData.email,
          phone: associationData.phone,
          siteUrl: associationData.website,
          isPublic: true,
          isVerified: false,
          tenantId: tenant.id,
        }
      });
  
      // Vérifier d'abord que l'utilisateur existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id: associationData.userId }
      });
      
      if (!existingUser) {
        throw new Error(`Utilisateur avec l'ID ${associationData.userId} n'existe pas`);
      }
      
      // Créer automatiquement l'UserTenantMembership avec rôle ADMIN pour le créateur
      const adminMembership = await (this.prisma as any).userTenantMembership.create({
        data: {
          userId: associationData.userId,
          tenantId: tenant.id,
          role: 'ADMIN', // Le créateur devient automatiquement admin
          isActive: true,
        }
      });

      return {
        association: newAssociation,
        tenant: tenant,
        adminMembership: adminMembership
      };
    } catch (error) {
      console.error('❌ Erreur createAssociation:', error);
      throw new Error('Erreur lors de la création de l\'association');
    }
  }

  /**
   * Crée un utilisateur de test pour le développement
   */
  async createTestUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    cognitoId: string;
  }): Promise<any> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          cognitoId: userData.cognitoId,
          role: 'MEMBER',
          isActive: true,
        }
      });

      return newUser;
    } catch (error) {
      console.error('❌ Erreur createTestUser:', error);
      throw new Error('Erreur lors de la création de l\'utilisateur de test');
    }
  }

  /**
   * Récupère la liste des administrateurs d'une association
   */
  async getAssociationAdmins(tenantId: string): Promise<any> {
    try {
      const admins = await (this.prisma as any).userTenantMembership.findMany({
        where: {
          tenantId: tenantId,
          isActive: true,
          role: {
            in: ['ADMIN', 'MANAGER']
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return admins.map((membership: any) => ({
        id: membership.user.id,
        email: membership.user.email,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        role: membership.role,
        joinedAt: membership.joinedAt,
        isCreator: membership.role === 'ADMIN' // Logique simplifiée
      }));
    } catch (error) {
      console.error('❌ Erreur getAssociationAdmins:', error);
      throw new Error('Erreur lors de la récupération des administrateurs');
    }
  }

  /**
   * Ajoute un administrateur à une association
   */
  async addAssociationAdmin(tenantId: string, adminData: {
    email: string;
    role?: string;
  }): Promise<any> {
    try {
      // Chercher l'utilisateur par email
      const user = await this.prisma.user.findFirst({
        where: { email: adminData.email }
      });

      if (!user) {
        throw new Error(`Utilisateur avec l'email ${adminData.email} n'existe pas`);
      }
      
      // Vérifier s'il n'est pas déjà admin de cette association
      const existingMembership = await (this.prisma as any).userTenantMembership.findUnique({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId: tenantId
          }
        }
      });

      if (existingMembership) {
        throw new Error('Cet utilisateur est déjà membre de cette association');
      }

      // Créer le membership
      const newMembership = await (this.prisma as any).userTenantMembership.create({
        data: {
          userId: user.id,
          tenantId: tenantId,
          role: adminData.role || 'MANAGER',
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      return {
        id: newMembership.user.id,
        email: newMembership.user.email,
        firstName: newMembership.user.firstName,
        lastName: newMembership.user.lastName,
        role: newMembership.role,
        joinedAt: newMembership.joinedAt,
        isCreator: false
      };
    } catch (error) {
      console.error('❌ Erreur addAssociationAdmin:', error);
      throw new Error(error.message || 'Erreur lors de l\'ajout de l\'administrateur');
    }
  }

  /**
   * Retire un administrateur d'une association
   */
  async removeAssociationAdmin(tenantId: string, userId: string): Promise<any> {
    try {
      // Vérifier que le membership existe
      const membership = await (this.prisma as any).userTenantMembership.findUnique({
        where: {
          userId_tenantId: {
            userId: userId,
            tenantId: tenantId
          }
        }
      });

      if (!membership) {
        throw new Error('Cet utilisateur n\'est pas administrateur de cette association');
      }

      // Ne pas permettre de retirer le créateur (premier admin)
      if (membership.role === 'ADMIN') {
        throw new Error('Impossible de retirer le créateur de l\'association');
      }

      // Supprimer le membership
      await (this.prisma as any).userTenantMembership.delete({
        where: {
          userId_tenantId: {
            userId: userId,
            tenantId: tenantId
          }
        }
      });

      return { message: 'Administrateur retiré avec succès' };
    } catch (error) {
      console.error('❌ Erreur removeAssociationAdmin:', error);
      throw new Error(error.message || 'Erreur lors de la suppression de l\'administrateur');
    }
  }

  /**
   * Récupère les associations de l'utilisateur
   */
  async getMyAssociations(userId: string): Promise<any[]> {
    try {
      // Récupérer les associations où l'utilisateur est membre/admin
      const memberships = await this.prisma.userTenantMembership.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          tenant: {
            include: {
              associationListing: {
                include: {
                  campaigns: {
                    where: { status: 'ACTIVE' },
                    select: {
                      id: true,
                      title: true,
                      goal: true,
                      raised: true,
                      status: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Transformer les données pour retourner les associations avec le rôle
      return memberships
        .filter(membership => membership.tenant.associationListing) // Filtrer uniquement les tenants qui ont une association
        .map(membership => ({
          association: membership.tenant.associationListing,
          role: membership.role,
          isActive: membership.isActive,
          joinedAt: membership.joinedAt,
          tenant: {
            id: membership.tenant.id,
            slug: membership.tenant.slug,
            name: membership.tenant.name
          }
        }));
    } catch (error) {
      console.error('Erreur lors de la récupération des associations de l\'utilisateur:', error);
      throw new Error('Impossible de récupérer les associations de l\'utilisateur');
    }
  }

  /**
   * Met à jour une association
   */
  async updateAssociation(id: string, updateData: {
    name?: string
    description?: string
    email?: string
    phone?: string
    siteUrl?: string
    city?: string
    country?: string
    location?: string
    category?: string
  }) {
    console.log('🔄 [HubService] Mise à jour association:', { id, updateData })

    try {
      // Vérifier que l'association existe
      const existingAssociation = await this.prisma.associationListing.findUnique({
        where: { id },
        include: {
          tenant: true
        }
      })

      if (!existingAssociation) {
        throw new Error(`Association avec l'ID ${id} non trouvée`)
      }

      // Mise à jour de l'association
      const updatedAssociation = await this.prisma.associationListing.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.description && { description: updateData.description }),
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.phone && { phone: updateData.phone }),
          ...(updateData.siteUrl && { siteUrl: updateData.siteUrl }),
          ...(updateData.city && { city: updateData.city }),
          ...(updateData.country && { country: updateData.country }),
          ...(updateData.location && { location: updateData.location }),
          ...(updateData.category && { category: updateData.category }),
          updatedAt: new Date()
        },
        include: {
          tenant: true,
          campaigns: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      console.log('✅ [HubService] Association mise à jour avec succès:', updatedAssociation.id)

      return {
        id: updatedAssociation.id,
        tenantId: updatedAssociation.tenantId,
        name: updatedAssociation.name,
        description: updatedAssociation.description,
        logo: updatedAssociation.logo,
        logoUrl: updatedAssociation.logoUrl,
        coverImage: updatedAssociation.coverImage,
        category: updatedAssociation.category,
        location: updatedAssociation.location,
        city: updatedAssociation.city,
        country: updatedAssociation.country,
        email: updatedAssociation.email,
        phone: updatedAssociation.phone,
        siteUrl: updatedAssociation.siteUrl,
        isPublic: updatedAssociation.isPublic,
        isVerified: updatedAssociation.isVerified,
        activeCampaigns: updatedAssociation.campaigns?.filter(c => c.status === 'ACTIVE').length || 0,
        totalCampaigns: updatedAssociation.campaigns?.length || 0,
        totalRaised: Number(updatedAssociation.totalRaised || 0),
        donationsCount: updatedAssociation.donationsCount || 0,
        createdAt: updatedAssociation.createdAt.toISOString(),
        updatedAt: updatedAssociation.updatedAt.toISOString(),
        tenant: {
          id: updatedAssociation.tenant.id,
          slug: updatedAssociation.tenant.slug,
          name: updatedAssociation.tenant.name
        },
        campaigns: updatedAssociation.campaigns?.map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          goal: Number(campaign.goal),
          raised: Number(campaign.raised || 0),
          status: campaign.status,
          createdAt: campaign.createdAt.toISOString(),
          updatedAt: campaign.updatedAt.toISOString()
        })) || []
      }

    } catch (error) {
      console.error('❌ [HubService] Erreur lors de la mise à jour de l\'association:', error)
      throw error
    }
  }
}
