import { DonationService, CreateDonationDto } from './donation.service';
export declare class DonationController {
    private readonly donationService;
    private readonly logger;
    constructor(donationService: DonationService);
    createDonation(req: any, createDonationDto: CreateDonationDto): Promise<{
        success: boolean;
        data: {
            donationId: any;
            clientSecret: string;
            amount: any;
            currency: any;
            campaign: any;
        };
    }>;
    createPublicDonation(createDonationDto: CreateDonationDto & {
        tenantId: string;
    }): Promise<{
        success: boolean;
        data: {
            donationId: any;
            clientSecret: string;
            amount: any;
            currency: any;
        };
    }>;
    confirmDonation(req: any, paymentIntentId: string): Promise<{
        success: boolean;
        data: {
            donationId: any;
            amount: any;
            status: any;
            campaign: any;
        };
    }>;
    confirmPublicDonation(paymentIntentId: string): Promise<{
        success: boolean;
        data: {
            donationId: any;
            amount: any;
            currency: any;
            status: any;
        };
    }>;
    getDonationHistory(req: any, limit?: string, offset?: string, tenantId?: string): Promise<{
        success: boolean;
        data: any[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    getCampaignDonations(req: any, campaignId: string, limit?: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    getCampaignDonationStats(req: any, campaignId: string): Promise<{
        success: boolean;
        data: {
            totalAmount: number | import("@prisma/client/runtime/library").Decimal;
            donationCount: number;
            averageAmount: number | import("@prisma/client/runtime/library").Decimal;
        };
    }>;
}
