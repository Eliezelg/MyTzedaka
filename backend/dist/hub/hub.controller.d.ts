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
    getGlobalStats(): Promise<HubStatsDto>;
    getPopularCampaigns(limit?: string): Promise<any[]>;
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
    test(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
