import { HubService } from './hub.service';
import { HubStatsDto, AssociationSearchDto, DonorProfileDto } from './dto/hub.dto';
export declare class HubController {
    private readonly hubService;
    constructor(hubService: HubService);
    getPublicAssociations(): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getAssociationById(id: string): Promise<any>;
    getAssociationBySlug(slug: string): Promise<any>;
    getMyAssociations(req: any): Promise<any[]>;
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
        stripeMode?: 'PLATFORM' | 'CUSTOM';
        stripeSecretKey?: string;
        stripePublishableKey?: string;
        associationPurpose?: string;
        legalInfo?: any;
        contactInfo?: any;
        additionalInfo?: any;
    }, req: any): Promise<any>;
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
    getGlobalStats(): Promise<HubStatsDto>;
    getPopularCampaigns(limit?: string): Promise<any[]>;
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
    searchAssociations(searchDto: AssociationSearchDto): Promise<{
        associations: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createOrUpdateDonorProfile(donorData: {
        email: string;
        cognitoId: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }): Promise<DonorProfileDto>;
    recordDonorActivity(donorId: string, activityData: {
        tenantId: string;
        donationAmount?: number;
        isFavorite?: boolean;
    }): Promise<any>;
    getDonorGlobalHistory(donorId: string): Promise<DonorProfileDto>;
    updateDonorGlobalStats(donorId: string): Promise<DonorProfileDto>;
    testStripe(): Promise<{
        message: string;
    }>;
    getTenantStripePublishableKey(tenantId: string): Promise<{
        publishableKey: string;
    }>;
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
    test(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
