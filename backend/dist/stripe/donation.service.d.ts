import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { DonationSource } from '@prisma/client';
import Stripe from 'stripe';
export interface CreateDonationDto {
    amount: number;
    currency?: string;
    campaignId?: string;
    donorEmail?: string;
    donorName?: string;
    isAnonymous?: boolean;
    purpose?: string;
    source?: DonationSource;
    sourceUrl?: string;
}
export interface DonationWithPaymentIntent {
    donation: any;
    paymentIntent: Stripe.PaymentIntent;
    clientSecret: string;
}
export declare class DonationService {
    private prisma;
    private stripeService;
    private readonly logger;
    constructor(prisma: PrismaService, stripeService: StripeService);
    createDonation(tenantId: string, userId: string, createDonationDto: CreateDonationDto): Promise<DonationWithPaymentIntent>;
    confirmDonation(paymentIntentId: string): Promise<any>;
    failDonation(paymentIntentId: string, reason?: string): Promise<any>;
    getDonationHistory(userId: string, tenantId?: string, limit?: number, offset?: number): Promise<{
        donations: any[];
        total: number;
    }>;
    getCampaignDonations(campaignId: string, tenantId: string, limit?: number): Promise<any[]>;
    getCampaignDonationStats(campaignId: string, tenantId: string): Promise<{
        totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        donationCount: number;
        averageAmount: number | import("@prisma/client/runtime/library").Decimal;
    }>;
}
