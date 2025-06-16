import { DonorPortalService } from './donor-portal.service';
import { CreateDonorProfileDto, UpdateDonorProfileDto, DonorProfileDto, DonorHistoryQueryDto, ToggleFavoriteDto } from './dto/donor-portal.dto';
export declare class DonorPortalController {
    private readonly donorPortalService;
    constructor(donorPortalService: DonorPortalService);
    getDonorProfile(email: string): Promise<DonorProfileDto>;
    createDonorProfile(createDto: CreateDonorProfileDto): Promise<DonorProfileDto>;
    updateDonorProfile(email: string, updateDto: UpdateDonorProfileDto): Promise<DonorProfileDto>;
    getDonorHistory(donorProfileId: string, queryDto: DonorHistoryQueryDto): Promise<import("./dto/donor-portal.dto").DonorHistoryResponseDto>;
    getFavoriteAssociations(donorProfileId: string): Promise<{
        donorStats: {
            totalDonated: number;
            donationsCount: number;
            lastDonationAt: Date;
        };
        tenant: {
            name: string;
            id: string;
            slug: string;
            domain: string | null;
            status: import(".prisma/client").$Enums.TenantStatus;
            theme: import("@prisma/client/runtime/library").JsonValue;
            settings: import("@prisma/client/runtime/library").JsonValue;
            stripeMode: import(".prisma/client").$Enums.StripeMode;
            createdAt: Date;
            updatedAt: Date;
        };
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        tenantId: string;
        description: string;
        totalCampaigns: number;
        logoUrl: string | null;
        logo: string | null;
        coverImage: string | null;
        category: string;
        location: string;
        city: string | null;
        country: string | null;
        siteUrl: string | null;
        isPublic: boolean;
        isVerified: boolean;
        activeCampaigns: number;
        totalRaised: import("@prisma/client/runtime/library").Decimal;
        donationsCount: number;
    }[]>;
    toggleFavoriteAssociation(donorProfileId: string, toggleDto: ToggleFavoriteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        totalDonations: number;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        lastDonationAt: Date | null;
        isFavorite: boolean;
        donorProfileId: string;
    }>;
    getDonorStats(donorProfileId: string): Promise<import("./dto/donor-portal.dto").DonorStatsDto>;
}
