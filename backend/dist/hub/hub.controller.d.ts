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
    createAssociation(associationData: {
        name: string;
        description: string;
        category?: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
        website?: string;
        userId: string;
    }): Promise<any>;
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
