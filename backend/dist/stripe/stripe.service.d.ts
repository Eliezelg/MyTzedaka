import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
export declare class StripeService {
    private configService;
    private prisma;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, prisma: PrismaService);
    createPaymentIntent(params: {
        amount: number;
        currency?: string;
        description?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.PaymentIntent>;
    getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent>;
    cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    verifyWebhookSignature(payload: string, signature: string): Stripe.Event;
    createRefund(paymentIntentId: string, amount?: number, reason?: Stripe.RefundCreateParams.Reason): Promise<Stripe.Refund>;
    static centsToEuros(cents: number): number;
    static eurosToCents(euros: number): number;
    getStripeAccountByTenantId(tenantId: string): Promise<any>;
}
