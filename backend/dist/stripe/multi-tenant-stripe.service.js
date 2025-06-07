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
var MultiTenantStripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiTenantStripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const encryption_service_1 = require("./encryption.service");
const stripe_1 = require("stripe");
const client_1 = require("@prisma/client");
let MultiTenantStripeService = MultiTenantStripeService_1 = class MultiTenantStripeService {
    constructor(prisma, configService, encryptionService) {
        this.prisma = prisma;
        this.configService = configService;
        this.encryptionService = encryptionService;
        this.logger = new common_1.Logger(MultiTenantStripeService_1.name);
        this.stripeInstances = new Map();
        this.platformStripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-05-28.basil',
        });
    }
    async getStripeInstance(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { stripeAccount: true },
        });
        if (!tenant) {
            throw new Error('Tenant non trouvé');
        }
        if (tenant.stripeMode === client_1.StripeMode.PLATFORM) {
            return this.platformStripe;
        }
        if (tenant.stripeMode === client_1.StripeMode.CUSTOM) {
            if (!tenant.stripeAccount?.stripeSecretKey) {
                throw new Error('Compte Stripe non configuré pour ce tenant');
            }
            if (this.stripeInstances.has(tenantId)) {
                return this.stripeInstances.get(tenantId);
            }
            const decryptedKey = await this.encryptionService.decrypt(tenant.stripeAccount.stripeSecretKey);
            const stripeInstance = new stripe_1.default(decryptedKey, {
                apiVersion: '2025-05-28.basil',
            });
            this.stripeInstances.set(tenantId, stripeInstance);
            return stripeInstance;
        }
        throw new Error('Mode Stripe non valide');
    }
    async createPaymentIntent(tenantId, amount, currency = 'EUR', metadata) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { stripeAccount: true },
        });
        if (!tenant) {
            throw new Error('Tenant non trouvé');
        }
        const stripe = await this.getStripeInstance(tenantId);
        let paymentIntentData = {
            amount: Math.round(amount * 100),
            currency,
            metadata: {
                tenantId,
                ...metadata,
            },
        };
        if (tenant.stripeMode === client_1.StripeMode.PLATFORM) {
            if (!tenant.stripeAccount?.stripeConnectAccountId) {
                throw new Error('Compte Stripe Connect non configuré');
            }
            const feePercentage = tenant.stripeAccount.feePercentage || 0;
            const applicationFeeAmount = Math.round(amount * Number(feePercentage) / 100 * 100);
            paymentIntentData = {
                ...paymentIntentData,
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: tenant.stripeAccount.stripeConnectAccountId,
                },
            };
        }
        try {
            const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
            this.logger.log(`PaymentIntent créé: ${paymentIntent.id} pour tenant: ${tenantId}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Erreur création PaymentIntent: ${error.message}`, error.stack);
            throw error;
        }
    }
    async confirmPaymentIntent(tenantId, paymentIntentId, paymentMethodId) {
        const stripe = await this.getStripeInstance(tenantId);
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Erreur confirmation PaymentIntent: ${error.message}`, error.stack);
            throw error;
        }
    }
    async retrievePaymentIntent(tenantId, paymentIntentId) {
        const stripe = await this.getStripeInstance(tenantId);
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error(`Erreur récupération PaymentIntent: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createConnectAccount(tenantId, email, businessName) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new Error('Tenant non trouvé');
        }
        if (tenant.stripeMode !== client_1.StripeMode.PLATFORM) {
            throw new Error('Le tenant n\'utilise pas Stripe Connect');
        }
        try {
            const account = await this.platformStripe.accounts.create({
                type: 'standard',
                country: 'FR',
                email,
                business_profile: {
                    name: businessName,
                },
                metadata: {
                    tenantId,
                },
            });
            await this.prisma.stripeAccount.upsert({
                where: { tenantId },
                update: {
                    stripeConnectAccountId: account.id,
                    stripeConnectStatus: account.details_submitted ? 'active' : 'pending',
                    stripeAccountEmail: email,
                    stripeAccountName: businessName,
                },
                create: {
                    tenantId,
                    stripeConnectAccountId: account.id,
                    stripeConnectStatus: account.details_submitted ? 'active' : 'pending',
                    stripeAccountEmail: email,
                    stripeAccountName: businessName,
                },
            });
            return account;
        }
        catch (error) {
            this.logger.error(`Erreur création compte Connect: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createConnectOnboardingLink(tenantId, returnUrl, refreshUrl) {
        const stripeAccount = await this.prisma.stripeAccount.findUnique({
            where: { tenantId },
        });
        if (!stripeAccount?.stripeConnectAccountId) {
            throw new Error('Compte Connect non trouvé');
        }
        try {
            const accountLink = await this.platformStripe.accountLinks.create({
                account: stripeAccount.stripeConnectAccountId,
                refresh_url: refreshUrl,
                return_url: returnUrl,
                type: 'account_onboarding',
            });
            return accountLink;
        }
        catch (error) {
            this.logger.error(`Erreur création lien onboarding: ${error.message}`, error.stack);
            throw error;
        }
    }
    async configureCustomStripeAccount(tenantId, publishableKey, secretKey, webhookSecret) {
        const encryptedPublishableKey = await this.encryptionService.encrypt(publishableKey);
        const encryptedSecretKey = await this.encryptionService.encrypt(secretKey);
        const encryptedWebhookSecret = webhookSecret
            ? await this.encryptionService.encrypt(webhookSecret)
            : null;
        try {
            const testStripe = new stripe_1.default(secretKey, { apiVersion: '2025-05-28.basil' });
            await testStripe.balance.retrieve();
        }
        catch (error) {
            throw new Error('Clés Stripe invalides');
        }
        await this.prisma.stripeAccount.upsert({
            where: { tenantId },
            update: {
                stripePublishableKey: encryptedPublishableKey,
                stripeSecretKey: encryptedSecretKey,
                stripeWebhookSecret: encryptedWebhookSecret,
                isActive: true,
                lastVerifiedAt: new Date(),
            },
            create: {
                tenantId,
                stripePublishableKey: encryptedPublishableKey,
                stripeSecretKey: encryptedSecretKey,
                stripeWebhookSecret: encryptedWebhookSecret,
                isActive: true,
                lastVerifiedAt: new Date(),
            },
        });
        this.stripeInstances.delete(tenantId);
        return { success: true };
    }
    async getPublishableKey(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { stripeAccount: true },
        });
        if (!tenant) {
            throw new Error('Tenant non trouvé');
        }
        if (tenant.stripeMode === client_1.StripeMode.PLATFORM) {
            return this.configService.get('STRIPE_PUBLISHABLE_KEY');
        }
        if (tenant.stripeMode === client_1.StripeMode.CUSTOM) {
            if (!tenant.stripeAccount?.stripePublishableKey) {
                throw new Error('Clé publique Stripe non configurée');
            }
            return await this.encryptionService.decrypt(tenant.stripeAccount.stripePublishableKey);
        }
        throw new Error('Mode Stripe non valide');
    }
    async handleWebhook(tenantId, payload, signature) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { stripeAccount: true },
        });
        if (!tenant) {
            throw new Error('Tenant non trouvé');
        }
        let webhookSecret;
        if (tenant.stripeMode === client_1.StripeMode.PLATFORM) {
            webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        }
        else if (tenant.stripeMode === client_1.StripeMode.CUSTOM) {
            if (!tenant.stripeAccount?.stripeWebhookSecret) {
                throw new Error('Secret webhook non configuré');
            }
            webhookSecret = await this.encryptionService.decrypt(tenant.stripeAccount.stripeWebhookSecret);
        }
        else {
            throw new Error('Mode Stripe non valide');
        }
        const stripe = await this.getStripeInstance(tenantId);
        try {
            const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            return event;
        }
        catch (error) {
            this.logger.error(`Erreur validation webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MultiTenantStripeService = MultiTenantStripeService;
exports.MultiTenantStripeService = MultiTenantStripeService = MultiTenantStripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        encryption_service_1.EncryptionService])
], MultiTenantStripeService);
//# sourceMappingURL=multi-tenant-stripe.service.js.map