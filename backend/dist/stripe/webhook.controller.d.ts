import { RawBodyRequest } from '@nestjs/common';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { DonationService } from './donation.service';
import { Request } from 'express';
export declare class StripeWebhookController {
    private multiTenantStripeService;
    private donationService;
    private readonly logger;
    constructor(multiTenantStripeService: MultiTenantStripeService, donationService: DonationService);
    handleWebhook(request: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    private processWebhookEvent;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handlePaymentIntentCanceled;
    private handleAccountUpdated;
    private handleAccountDeauthorized;
}
