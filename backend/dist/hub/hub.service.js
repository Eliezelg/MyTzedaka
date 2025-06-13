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
exports.HubService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HubService = class HubService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPublicAssociations() {
        try {
            const [data, total] = await Promise.all([
                this.prisma.associationListing.findMany({
                    where: { isPublic: true },
                    orderBy: [
                        { isVerified: 'desc' },
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
        }
        catch (error) {
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 0,
                pages: 0
            };
        }
    }
    async getAssociationById(id) {
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
            const activeCampaignsCount = association.campaigns.length;
            const totalRaised = association.campaigns.reduce((sum, campaign) => sum + Number(campaign.raised || 0), 0);
            return {
                ...association,
                activeCampaignsCount,
                totalRaised,
                tenantInfo: association.tenant,
                campaigns: association.campaigns.map(campaign => ({
                    ...campaign,
                    goal: Number(campaign.goal),
                    raised: Number(campaign.raised),
                    progressPercentage: campaign.goal ?
                        Math.round((Number(campaign.raised) / Number(campaign.goal)) * 100) : 0
                }))
            };
        }
        catch (error) {
            console.error('❌ Erreur getAssociationById:', error);
            throw error;
        }
    }
    async getAssociationBySlug(slug) {
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
        }
        catch (error) {
            console.error('Erreur lors de la récupération de l\'association par slug:', error);
            throw new Error('Impossible de récupérer l\'association');
        }
    }
    async getGlobalStats() {
        try {
            const [totalAssociations, verifiedAssociations, totalCampaigns, activeCampaigns, totalDonations, totalAmount] = await Promise.all([
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
        }
        catch (error) {
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
    async getPopularCampaigns(limit = 10) {
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
        }
        catch (error) {
            return [];
        }
    }
    async getCampaigns(query) {
        try {
            const page = parseInt(query.page || '1');
            const limit = Math.min(parseInt(query.limit || '12'), 50);
            const skip = (page - 1) * limit;
            const search = query.search;
            const category = query.category;
            const status = query.status || 'ACTIVE';
            const isFeatured = query.featured === 'true';
            const isUrgent = query.urgent === 'true';
            const where = {
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
                    raised: Number(campaign.raised),
                    goal: Number(campaign.goal),
                    avgDonation: Number(campaign.avgDonation),
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
        }
        catch (error) {
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
    async getCampaignById(id) {
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
                raised: Number(campaign.raised),
                goal: Number(campaign.goal),
                avgDonation: Number(campaign.avgDonation),
                associationName: campaign.associationListing?.name || campaign.tenant.name,
                associationLogo: campaign.associationListing?.logoUrl,
                associationLocation: campaign.associationListing?.location,
                isVerifiedAssociation: campaign.associationListing?.isVerified || false,
                recentDonations: campaign.donations.map(donation => ({
                    ...donation,
                    amount: Number(donation.amount),
                })),
            };
        }
        catch (error) {
            console.error('❌ Erreur getCampaignById:', error);
            throw error;
        }
    }
    async getDonorGlobalHistory(donorProfileId) {
        try {
            const donorProfile = await this.prisma.donorProfile.findUnique({
                where: { id: donorProfileId },
                include: {
                    tenantAccess: {
                        include: {}
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
        }
        catch (error) {
            throw error;
        }
    }
    async updateDonorGlobalStats(donorProfileId) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async searchAssociations(searchDto) {
        try {
            const query = searchDto.q || searchDto.query;
            const page = searchDto.page || 1;
            const limit = searchDto.limit || 12;
            const sortBy = searchDto.sortBy || 'relevance';
            const whereConditions = {
                isPublic: true
            };
            if (query && query.trim()) {
                whereConditions.OR = [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ];
            }
            if (searchDto.category) {
                whereConditions.category = searchDto.category;
            }
            if (searchDto.location) {
                whereConditions.location = { contains: searchDto.location, mode: 'insensitive' };
            }
            if (searchDto.verified !== undefined) {
                whereConditions.isVerified = searchDto.verified;
            }
            let orderBy = [];
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
            const offset = (page - 1) * limit;
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
        }
        catch (error) {
            return {
                associations: [],
                total: 0,
                page: 1,
                limit: 12,
                totalPages: 0
            };
        }
    }
    async createDonorProfile(donorData) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async findOrCreateDonorProfile(donorData) {
        try {
            let donorProfile = await this.prisma.donorProfile.findUnique({
                where: { email: donorData.email }
            });
            if (!donorProfile) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async recordTenantActivity(donorProfileId, tenantId, activity) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async createAssociation(associationData) {
        try {
            if (!associationData.userId || associationData.userId.trim() === '') {
                throw new Error('userId est requis pour créer une association');
            }
            console.log('🔍 Données reçues pour création association:', associationData);
            const baseSlug = associationData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            let slug = baseSlug;
            let counter = 1;
            while (await this.prisma.tenant.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            const tenant = await this.prisma.tenant.create({
                data: {
                    slug: slug,
                    name: associationData.name,
                    status: 'ACTIVE'
                }
            });
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
            const existingUser = await this.prisma.user.findUnique({
                where: { id: associationData.userId }
            });
            if (!existingUser) {
                throw new Error(`Utilisateur avec l'ID ${associationData.userId} n'existe pas`);
            }
            const adminMembership = await this.prisma.userTenantMembership.create({
                data: {
                    userId: associationData.userId,
                    tenantId: tenant.id,
                    role: 'ADMIN',
                    isActive: true,
                }
            });
            return {
                association: newAssociation,
                tenant: tenant,
                adminMembership: adminMembership
            };
        }
        catch (error) {
            console.error('❌ Erreur createAssociation:', error);
            throw new Error('Erreur lors de la création de l\'association');
        }
    }
    async createTestUser(userData) {
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
        }
        catch (error) {
            console.error('❌ Erreur createTestUser:', error);
            throw new Error('Erreur lors de la création de l\'utilisateur de test');
        }
    }
    async getAssociationAdmins(tenantId) {
        try {
            const admins = await this.prisma.userTenantMembership.findMany({
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
            return admins.map((membership) => ({
                id: membership.user.id,
                email: membership.user.email,
                firstName: membership.user.firstName,
                lastName: membership.user.lastName,
                role: membership.role,
                joinedAt: membership.joinedAt,
                isCreator: membership.role === 'ADMIN'
            }));
        }
        catch (error) {
            console.error('❌ Erreur getAssociationAdmins:', error);
            throw new Error('Erreur lors de la récupération des administrateurs');
        }
    }
    async addAssociationAdmin(tenantId, adminData) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { email: adminData.email }
            });
            if (!user) {
                throw new Error(`Utilisateur avec l'email ${adminData.email} n'existe pas`);
            }
            const existingMembership = await this.prisma.userTenantMembership.findUnique({
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
            const newMembership = await this.prisma.userTenantMembership.create({
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
        }
        catch (error) {
            console.error('❌ Erreur addAssociationAdmin:', error);
            throw new Error(error.message || 'Erreur lors de l\'ajout de l\'administrateur');
        }
    }
    async removeAssociationAdmin(tenantId, userId) {
        try {
            const membership = await this.prisma.userTenantMembership.findUnique({
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
            if (membership.role === 'ADMIN') {
                throw new Error('Impossible de retirer le créateur de l\'association');
            }
            await this.prisma.userTenantMembership.delete({
                where: {
                    userId_tenantId: {
                        userId: userId,
                        tenantId: tenantId
                    }
                }
            });
            return { message: 'Administrateur retiré avec succès' };
        }
        catch (error) {
            console.error('❌ Erreur removeAssociationAdmin:', error);
            throw new Error(error.message || 'Erreur lors de la suppression de l\'administrateur');
        }
    }
    async getMyAssociations(userId) {
        try {
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
            return memberships
                .filter(membership => membership.tenant.associationListing)
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
        }
        catch (error) {
            console.error('Erreur lors de la récupération des associations de l\'utilisateur:', error);
            throw new Error('Impossible de récupérer les associations de l\'utilisateur');
        }
    }
    async updateAssociation(id, updateData) {
        console.log('🔄 [HubService] Mise à jour association:', { id, updateData });
        try {
            const existingAssociation = await this.prisma.associationListing.findUnique({
                where: { id },
                include: {
                    tenant: true
                }
            });
            if (!existingAssociation) {
                throw new Error(`Association avec l'ID ${id} non trouvée`);
            }
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
            });
            console.log('✅ [HubService] Association mise à jour avec succès:', updatedAssociation.id);
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
            };
        }
        catch (error) {
            console.error('❌ [HubService] Erreur lors de la mise à jour de l\'association:', error);
            throw error;
        }
    }
};
exports.HubService = HubService;
exports.HubService = HubService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HubService);
//# sourceMappingURL=hub.service.js.map