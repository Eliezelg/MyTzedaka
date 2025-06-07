import { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { DonationService } from './donation.service';
export declare class StripeController {
    private readonly stripeService;
    private readonly donationService;
    private readonly logger;
    constructor(stripeService: StripeService, donationService: DonationService);
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handlePaymentIntentCanceled;
    private handleChargeDisputeCreated;
    testWebhook(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
}
