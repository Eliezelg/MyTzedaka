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
        description: string;
        category?: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
        website?: string;
        tenantId?: string;
    }): Promise<any>;
}
