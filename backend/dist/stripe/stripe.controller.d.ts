import { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { DonationService } from './donation.service';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class StripeController {
    private readonly stripeService;
    private readonly donationService;
    private readonly multiTenantStripeService;
    private readonly prisma;
    private readonly logger;
    constructor(stripeService: StripeService, donationService: DonationService, multiTenantStripeService: MultiTenantStripeService, prisma: PrismaService);
    private getUserDefaultTenantId;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handlePaymentIntentCanceled;
    private handleChargeDisputeCreated;
    private handleAccountUpdated;
    createOnboardingLink(user: any, returnUrl: string, tenantId?: string, locale?: string): Promise<{
        url: string;
        expiresAt: number;
    }>;
    getConnectAccountStatus(user: any, tenantId?: string): Promise<{
        hasAccount: boolean;
        status: string;
        error: string;
        isActive?: undefined;
        requiresOnboarding?: undefined;
    } | {
        hasAccount: boolean;
        status: string;
        error?: undefined;
        isActive?: undefined;
        requiresOnboarding?: undefined;
    } | {
        hasAccount: boolean;
        status: any;
        isActive: any;
        requiresOnboarding: boolean;
        error?: undefined;
    }>;
    getUserAssociations(user: any): Promise<{
        associations: {
            tenantId: string;
            name: string;
            slug: string;
            logoUrl: string;
            role: import(".prisma/client").$Enums.UserRole;
            isDefault: boolean;
        }[];
    }>;
    createConnectAccount(user: any, tenantId?: string): Promise<{
        success: boolean;
        accountId: string;
        status: string;
        message: string;
    }>;
    testWebhook(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
}
