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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const multi_tenant_stripe_service_1 = require("./multi-tenant-stripe.service");
const donation_service_1 = require("./donation.service");
let StripeWebhookController = StripeWebhookController_1 = class StripeWebhookController {
    constructor(multiTenantStripeService, donationService) {
        this.multiTenantStripeService = multiTenantStripeService;
        this.donationService = donationService;
        this.logger = new common_1.Logger(StripeWebhookController_1.name);
    }
    async handleWebhook(request, signature) {
        const payload = request.rawBody;
        if (!payload) {
            this.logger.error('Payload manquant dans le webhook Stripe');
            throw new Error('Payload manquant');
        }
        if (!signature) {
            this.logger.error('Signature manquante dans le webhook Stripe');
            throw new Error('Signature manquante');
        }
        try {
            const event = await this.multiTenantStripeService.verifyWebhookSignature(payload, signature);
            this.logger.log(`Webhook reçu: ${event.type} - ${event.id}`);
            await this.processWebhookEvent(event);
            return { received: true };
        }
        catch (error) {
            this.logger.error(`Erreur webhook Stripe: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processWebhookEvent(event) {
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event);
                    break;
                case 'payment_intent.canceled':
                    await this.handlePaymentIntentCanceled(event);
                    break;
                case 'account.updated':
                    await this.handleAccountUpdated(event);
                    break;
                case 'account.application.deauthorized':
                    await this.handleAccountDeauthorized(event);
                    break;
                default:
                    this.logger.log(`Événement non traité: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error(`Erreur traitement événement ${event.type}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handlePaymentIntentSucceeded(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`PaymentIntent réussi: ${paymentIntent.id}`);
        try {
            await this.donationService.confirmDonation(paymentIntent.id);
            this.logger.log(`Donation confirmée pour PaymentIntent: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Erreur confirmation donation: ${paymentIntent.id}`, error.stack);
        }
    }
    async handlePaymentIntentFailed(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`PaymentIntent échoué: ${paymentIntent.id}`);
        try {
            await this.donationService.failDonation(paymentIntent.id, paymentIntent.last_payment_error?.message || 'Échec du paiement');
            this.logger.log(`Donation marquée comme échouée: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Erreur marquage échec donation: ${paymentIntent.id}`, error.stack);
        }
    }
    async handlePaymentIntentCanceled(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`PaymentIntent annulé: ${paymentIntent.id}`);
        try {
            await this.donationService.failDonation(paymentIntent.id, 'Paiement annulé');
            this.logger.log(`Donation marquée comme annulée: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Erreur marquage annulation donation: ${paymentIntent.id}`, error.stack);
        }
    }
    async handleAccountUpdated(event) {
        const account = event.data.object;
        this.logger.log(`Compte Stripe Connect mis à jour: ${account.id}`);
        try {
            await this.multiTenantStripeService.updateConnectAccountStatus(account.id, account);
            this.logger.log(`Statut compte Connect mis à jour: ${account.id}`);
        }
        catch (error) {
            this.logger.error(`Erreur mise à jour compte Connect: ${account.id}`, error.stack);
        }
    }
    async handleAccountDeauthorized(event) {
        const deauthorization = event.data.object;
        this.logger.log(`Compte déautorisé: ${deauthorization.account}`);
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)('/'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook Stripe pour tous les tenants' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook traité avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Signature invalide' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleWebhook", null);
exports.StripeWebhookController = StripeWebhookController = StripeWebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('stripe-webhook'),
    (0, common_1.Controller)('webhook/stripe'),
    __metadata("design:paramtypes", [multi_tenant_stripe_service_1.MultiTenantStripeService,
        donation_service_1.DonationService])
], StripeWebhookController);
//# sourceMappingURL=webhook.controller.js.map