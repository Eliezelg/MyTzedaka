import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import Stripe from 'stripe';
export declare class MultiTenantStripeService {
    private prisma;
    private configService;
    private encryptionService;
    private readonly logger;
    private platformStripe;
    private stripeInstances;
    constructor(prisma: PrismaService, configService: ConfigService, encryptionService: EncryptionService);
    getStripeInstance(tenantId: string): Promise<Stripe>;
    createPaymentIntent(tenantId: string, amount: number, currency?: string, metadata?: any): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    confirmPaymentIntent(tenantId: string, paymentIntentId: string, paymentMethodId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    retrievePaymentIntent(tenantId: string, paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    createConnectAccount(tenantId: string, email: string, businessName: string): Promise<Stripe.Response<Stripe.Account>>;
    createConnectOnboardingLink(tenantId: string, returnUrl: string, refreshUrl: string): Promise<Stripe.Response<Stripe.AccountLink>>;
    configureCustomStripeAccount(tenantId: string, publishableKey: string, secretKey: string, webhookSecret?: string): Promise<{
        success: boolean;
    }>;
    getPublishableKey(tenantId: string): Promise<string>;
    handleWebhook(tenantId: string, payload: Buffer, signature: string): Promise<Stripe.Event>;
}
