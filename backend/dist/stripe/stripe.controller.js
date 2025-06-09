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
var StripeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stripe_service_1 = require("./stripe.service");
const donation_service_1 = require("./donation.service");
let StripeController = StripeController_1 = class StripeController {
    constructor(stripeService, donationService) {
        this.stripeService = stripeService;
        this.donationService = donationService;
        this.logger = new common_1.Logger(StripeController_1.name);
    }
    async handleWebhook(req, signature) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        try {
            const payload = req.rawBody || req.body;
            if (!payload) {
                throw new common_1.BadRequestException('Missing request body');
            }
            const event = this.stripeService.verifyWebhookSignature(payload.toString(), signature);
            this.logger.log(`Webhook received: ${event.type} - ${event.id}`);
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'payment_intent.canceled':
                    await this.handlePaymentIntentCanceled(event.data.object);
                    break;
                case 'charge.dispute.created':
                    await this.handleChargeDisputeCreated(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event type: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            this.logger.error('Webhook processing failed:', error);
            throw new common_1.BadRequestException('Webhook processing failed');
        }
    }
    async handlePaymentIntentSucceeded(paymentIntent) {
        try {
            this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
            await this.donationService.confirmDonation(paymentIntent.id);
            this.logger.log(`Donation confirmed for PaymentIntent: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Error handling payment success for ${paymentIntent.id}:`, error);
        }
    }
    async handlePaymentIntentFailed(paymentIntent) {
        try {
            this.logger.log(`Payment failed: ${paymentIntent.id}`);
            await this.donationService.failDonation(paymentIntent.id, paymentIntent.last_payment_error?.message || 'Payment failed');
            this.logger.log(`Donation marked as failed for PaymentIntent: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Error handling payment failure for ${paymentIntent.id}:`, error);
        }
    }
    async handlePaymentIntentCanceled(paymentIntent) {
        try {
            this.logger.log(`Payment canceled: ${paymentIntent.id}`);
            await this.donationService.failDonation(paymentIntent.id, 'Payment canceled by user');
            this.logger.log(`Donation marked as canceled for PaymentIntent: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Error handling payment cancellation for ${paymentIntent.id}:`, error);
        }
    }
    async handleChargeDisputeCreated(dispute) {
        try {
            this.logger.warn(`Dispute created: ${dispute.id} for charge: ${dispute.charge}`);
            this.logger.warn(`Dispute details: ${JSON.stringify({
                id: dispute.id,
                amount: dispute.amount,
                currency: dispute.currency,
                reason: dispute.reason,
                status: dispute.status,
            })}`);
        }
        catch (error) {
            this.logger.error(`Error handling dispute for ${dispute.id}:`, error);
        }
    }
    async testWebhook() {
        this.logger.log('Test webhook endpoint called');
        return {
            success: true,
            message: 'Webhook endpoint is working',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('test-webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Test endpoint pour vérifier la configuration webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration webhook OK' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "testWebhook", null);
exports.StripeController = StripeController = StripeController_1 = __decorate([
    (0, swagger_1.ApiTags)('Stripe'),
    (0, common_1.Controller)('stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        donation_service_1.DonationService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map