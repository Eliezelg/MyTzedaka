import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { PrismaService } from '../prisma/prisma.service';
declare class ConfigureStripeDto {
    mode: 'PLATFORM' | 'CUSTOM';
    publishableKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    email?: string;
    businessName?: string;
}
declare class StripeOnboardingDto {
    returnUrl: string;
    refreshUrl: string;
}
export declare class StripeConfigController {
    private stripeService;
    private prisma;
    constructor(stripeService: MultiTenantStripeService, prisma: PrismaService);
    getStripeConfig(tenantId: string): Promise<{
        accountName: string;
        accountEmail: string;
        currency: string;
        feePercentage: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        connectStatus: string;
        lastVerifiedAt: Date;
        mode: import(".prisma/client").$Enums.StripeMode;
        isConfigured: boolean;
    }>;
    configureStripe(tenantId: string, dto: ConfigureStripeDto): Promise<{
        success: boolean;
        accountId: string;
        message: string;
    } | {
        success: boolean;
        message: string;
        accountId?: undefined;
    }>;
    createOnboardingLink(tenantId: string, dto: StripeOnboardingDto): Promise<{
        url: string;
        expiresAt: number;
    }>;
    getPublishableKey(tenantId: string): Promise<{
        publishableKey: string;
    }>;
    handleWebhook(tenantId: string, req: any): Promise<{
        received: boolean;
    }>;
}
export {};
