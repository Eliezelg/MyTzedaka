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
    getGlobalStats(): Promise<HubStatsDto>;
    getPopularCampaigns(limit?: number): Promise<any[]>;
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
    getDonorGlobalHistory(donorProfileId: string): Promise<DonorProfileDto>;
    updateDonorGlobalStats(donorProfileId: string): Promise<DonorProfileDto>;
}
