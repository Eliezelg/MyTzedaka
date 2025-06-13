import { PrismaService } from '../prisma/prisma.service';
import { HubStatsDto, AssociationSearchDto, DonorProfileDto, CreateDonorProfileDto, RecordActivityDto } from './dto/hub.dto';
export declare class HubService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPublicAssociations(): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getAssociationById(id: string): Promise<any>;
    getAssociationBySlug(slug: string): Promise<any>;
    getGlobalStats(): Promise<HubStatsDto>;
    getPopularCampaigns(limit?: number): Promise<any[]>;
    getCampaigns(query: any): Promise<{
        campaigns: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getCampaignById(id: string): Promise<any>;
    getDonorGlobalHistory(donorProfileId: string): Promise<DonorProfileDto>;
    updateDonorGlobalStats(donorProfileId: string): Promise<DonorProfileDto>;
    searchAssociations(searchDto: AssociationSearchDto): Promise<{
        associations: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createDonorProfile(donorData: CreateDonorProfileDto): Promise<DonorProfileDto>;
    findOrCreateDonorProfile(donorData: CreateDonorProfileDto): Promise<DonorProfileDto>;
    recordTenantActivity(donorProfileId: string, tenantId: string, activity: RecordActivityDto): Promise<any>;
    createAssociation(associationData: {
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
        userId: string;
        legalInfo?: any;
        contactInfo?: any;
        additionalInfo?: any;
    }): Promise<any>;
    createTestUser(userData: {
        email: string;
        firstName: string;
        lastName: string;
        cognitoId: string;
    }): Promise<any>;
    getAssociationAdmins(tenantId: string): Promise<any>;
    addAssociationAdmin(tenantId: string, adminData: {
        email: string;
        role?: string;
    }): Promise<any>;
    removeAssociationAdmin(tenantId: string, userId: string): Promise<any>;
    getMyAssociations(userId: string): Promise<any[]>;
    updateAssociation(id: string, updateData: {
        name?: string;
        description?: string;
        email?: string;
        phone?: string;
        siteUrl?: string;
        city?: string;
        country?: string;
        location?: string;
        category?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string;
        logo: string;
        logoUrl: string;
        coverImage: string;
        category: string;
        location: string;
        city: string;
        country: string;
        email: string;
        phone: string;
        siteUrl: string;
        isPublic: boolean;
        isVerified: boolean;
        activeCampaigns: number;
        totalCampaigns: number;
        totalRaised: number;
        donationsCount: number;
        createdAt: string;
        updatedAt: string;
        tenant: {
            id: string;
            slug: string;
            name: string;
        };
        campaigns: {
            id: string;
            title: string;
            description: string;
            goal: number;
            raised: number;
            status: import(".prisma/client").$Enums.CampaignStatus;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
}
