"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = require("stripe");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeService_1.name);
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
            throw new Error('STRIPE_SECRET_KEY is required');
        }
        this.stripe = new stripe_1.default(secretKey, {});
        this.logger.log('Stripe service initialized');
    }
    async createPaymentIntent(params) {
        try {
            const { amount, currency = 'eur', description, metadata = {} } = params;
            if (amount < 50) {
                throw new common_1.BadRequestException('Le montant minimum est de 0.50€');
            }
            if (amount > 10000000) {
                throw new common_1.BadRequestException('Le montant maximum est de 100,000€');
            }
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency,
                description,
                metadata: {
                    ...metadata,
                    source: 'mytzedaka_platform',
                    created_at: new Date().toISOString(),
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            this.logger.log(`PaymentIntent created: ${paymentIntent.id} for ${amount} ${currency}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error('Error creating PaymentIntent:', error);
            throw error;
        }
    }
    async getPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Error retrieving PaymentIntent ${paymentIntentId}:`, error);
            throw error;
        }
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const params = {};
            if (paymentMethodId) {
                params.payment_method = paymentMethodId;
            }
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, params);
            this.logger.log(`PaymentIntent confirmed: ${paymentIntentId}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Error confirming PaymentIntent ${paymentIntentId}:`, error);
            throw error;
        }
    }
    async cancelPaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
            this.logger.log(`PaymentIntent cancelled: ${paymentIntentId}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Error cancelling PaymentIntent ${paymentIntentId}:`, error);
            throw error;
        }
    }
    verifyWebhookSignature(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook verification');
        }
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            this.logger.log(`Webhook event verified: ${event.type}`);
            return event;
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed:', error);
            throw error;
        }
    }
    async createRefund(paymentIntentId, amount, reason) {
        try {
            const refundParams = {
                payment_intent: paymentIntentId,
            };
            if (amount) {
                refundParams.amount = amount;
            }
            if (reason) {
                refundParams.reason = reason;
            }
            const refund = await this.stripe.refunds.create(refundParams);
            this.logger.log(`Refund created: ${refund.id} for PaymentIntent ${paymentIntentId}`);
            return refund;
        }
        catch (error) {
            this.logger.error(`Error creating refund for ${paymentIntentId}:`, error);
            throw error;
        }
    }
    static centsToEuros(cents) {
        return Math.round(cents) / 100;
    }
    static eurosToCents(euros) {
        return Math.round(euros * 100);
    }
    async getStripeAccountByTenantId(tenantId) {
        try {
            const stripeAccount = await this.prisma.stripeAccount.findUnique({
                where: { tenantId },
            });
            return stripeAccount;
        }
        catch (error) {
            this.logger.error(`Error getting Stripe account for tenant ${tenantId}:`, error);
            throw error;
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map