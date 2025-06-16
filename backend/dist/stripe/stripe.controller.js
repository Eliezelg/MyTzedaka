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
const multi_tenant_stripe_service_1 = require("./multi-tenant-stripe.service");
const prisma_service_1 = require("../prisma/prisma.service");
const hub_jwt_auth_guard_1 = require("../auth/guards/hub-jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
let StripeController = StripeController_1 = class StripeController {
    constructor(stripeService, donationService, multiTenantStripeService, prisma) {
        this.stripeService = stripeService;
        this.donationService = donationService;
        this.multiTenantStripeService = multiTenantStripeService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeController_1.name);
    }
    async getUserDefaultTenantId(userId) {
        try {
            const membership = await this.prisma.userTenantMembership.findFirst({
                where: {
                    userId,
                    isActive: true,
                    role: {
                        in: ['ADMIN', 'MANAGER']
                    }
                },
                include: {
                    tenant: true
                },
                orderBy: {
                    joinedAt: 'asc'
                }
            });
            return membership?.tenant.id || null;
        }
        catch (error) {
            this.logger.error(`Erreur getUserDefaultTenantId pour userId ${userId}:`, error);
            return null;
        }
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
                case 'account.updated':
                    await this.handleAccountUpdated(event.data.object);
                    break;
                case 'account.application.authorized':
                    this.logger.log(`Stripe Connect account authorized: ${event.data.object.id}`);
                    break;
                case 'account.application.deauthorized':
                    this.logger.warn(`Stripe Connect account deauthorized: ${event.data.object.id}`);
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
    async handleAccountUpdated(account) {
        try {
            this.logger.log(`Stripe Connect account updated: ${account.id}`);
            await this.multiTenantStripeService.updateConnectAccountStatus(account.id, account);
            this.logger.log(`Account status updated for: ${account.id}`);
        }
        catch (error) {
            this.logger.error(`Error handling account update for ${account.id}:`, error);
        }
    }
    async createOnboardingLink(user, returnUrl, tenantId, locale = 'fr') {
        try {
            let targetTenantId = tenantId;
            if (!targetTenantId) {
                targetTenantId = user.tenantId || await this.getUserDefaultTenantId(user.id);
                if (!targetTenantId) {
                    throw new common_1.BadRequestException('Aucune association trouvée pour cet utilisateur. Veuillez spécifier un tenantId.');
                }
            }
            if (user.tenantId !== targetTenantId) {
                const membership = await this.prisma.userTenantMembership.findFirst({
                    where: {
                        userId: user.id,
                        tenantId: targetTenantId,
                        isActive: true,
                        role: {
                            in: ['ADMIN', 'MANAGER']
                        }
                    }
                });
                if (!membership) {
                    throw new common_1.BadRequestException('Accès non autorisé à cette association');
                }
            }
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: targetTenantId },
                include: { associationListing: true }
            });
            if (!tenant || !tenant.associationListing) {
                throw new common_1.BadRequestException('Association non trouvée');
            }
            const slug = tenant.slug;
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const successUrl = returnUrl || `${baseUrl}/${locale}/associations/${slug}/dashboard`;
            const refreshUrl = `${baseUrl}/${locale}/associations/${slug}/stripe-onboarding`;
            const accountLink = await this.multiTenantStripeService.createConnectOnboardingLink(targetTenantId, successUrl, refreshUrl);
            return {
                url: accountLink.url,
                expiresAt: accountLink.expires_at,
            };
        }
        catch (error) {
            this.logger.error('Error creating onboarding link:', error);
            throw new common_1.BadRequestException('Impossible de créer le lien d\'onboarding');
        }
    }
    async getConnectAccountStatus(user, tenantId) {
        try {
            let targetTenantId = tenantId;
            if (!targetTenantId) {
                targetTenantId = user.tenantId || await this.getUserDefaultTenantId(user.id);
                if (!targetTenantId) {
                    return {
                        hasAccount: false,
                        status: 'NOT_CREATED',
                        error: 'Aucune association trouvée pour cet utilisateur',
                    };
                }
            }
            if (user.tenantId !== targetTenantId) {
                const membership = await this.prisma.userTenantMembership.findFirst({
                    where: {
                        userId: user.id,
                        tenantId: targetTenantId,
                        isActive: true,
                        role: {
                            in: ['ADMIN', 'MANAGER']
                        }
                    }
                });
                if (!membership) {
                    throw new common_1.BadRequestException('Accès non autorisé à cette association');
                }
            }
            const account = await this.stripeService.getStripeAccountByTenantId(targetTenantId);
            if (!account) {
                return {
                    hasAccount: false,
                    status: 'NOT_CREATED',
                };
            }
            return {
                hasAccount: true,
                status: account.stripeConnectStatus,
                isActive: account.isActive,
                requiresOnboarding: account.stripeConnectStatus?.toLowerCase() === 'pending',
            };
        }
        catch (error) {
            this.logger.error('Error getting account status:', error);
            throw new common_1.BadRequestException('Impossible de récupérer le statut du compte');
        }
    }
    async getUserAssociations(user) {
        try {
            const memberships = await this.prisma.userTenantMembership.findMany({
                where: {
                    userId: user.id,
                    isActive: true,
                    role: {
                        in: ['ADMIN', 'MANAGER']
                    }
                },
                include: {
                    tenant: {
                        include: {
                            associationListing: {
                                select: {
                                    id: true,
                                    name: true,
                                    logoUrl: true,
                                }
                            }
                        }
                    }
                }
            });
            return {
                associations: memberships
                    .filter(m => m.tenant.associationListing)
                    .map(m => ({
                    tenantId: m.tenant.id,
                    name: m.tenant.associationListing.name,
                    slug: m.tenant.slug,
                    logoUrl: m.tenant.associationListing.logoUrl,
                    role: m.role,
                    isDefault: memberships[0]?.tenant.id === m.tenant.id
                }))
            };
        }
        catch (error) {
            this.logger.error('Error getting user associations:', error);
            throw new common_1.BadRequestException('Impossible de récupérer les associations');
        }
    }
    async createConnectAccount(user, tenantId) {
        try {
            let targetTenantId = tenantId;
            if (!targetTenantId) {
                targetTenantId = user.tenantId || await this.getUserDefaultTenantId(user.id);
                if (!targetTenantId) {
                    throw new common_1.BadRequestException('Aucune association trouvée pour cet utilisateur. Veuillez spécifier un tenantId.');
                }
            }
            if (user.tenantId !== targetTenantId) {
                const membership = await this.prisma.userTenantMembership.findFirst({
                    where: {
                        userId: user.id,
                        tenantId: targetTenantId,
                        isActive: true,
                        role: {
                            in: ['ADMIN', 'MANAGER']
                        }
                    }
                });
                if (!membership) {
                    throw new common_1.BadRequestException('Accès non autorisé à cette association');
                }
            }
            const existingAccount = await this.stripeService.getStripeAccountByTenantId(targetTenantId);
            if (existingAccount) {
                throw new common_1.BadRequestException('Un compte Stripe Connect existe déjà pour cette association');
            }
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: targetTenantId },
                include: { associationListing: true }
            });
            if (!tenant || !tenant.associationListing) {
                throw new common_1.BadRequestException('Association non trouvée');
            }
            const stripeAccount = await this.multiTenantStripeService.createConnectAccount(targetTenantId, tenant.associationListing.email, tenant.associationListing.name);
            this.logger.log(`Compte Stripe Connect créé manuellement pour ${tenant.associationListing.name}: ${stripeAccount.id}`);
            return {
                success: true,
                accountId: stripeAccount.id,
                status: 'PENDING',
                message: 'Compte Stripe Connect créé avec succès. Vous pouvez maintenant procéder à la configuration.'
            };
        }
        catch (error) {
            this.logger.error('Error creating Stripe Connect account:', error);
            throw new common_1.BadRequestException('Impossible de créer le compte Stripe Connect');
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
    (0, common_1.Get)('connect/onboarding'),
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Génère un lien d\'onboarding Stripe Connect' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lien d\'onboarding généré' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('returnUrl')),
    __param(2, (0, common_1.Query)('tenantId')),
    __param(3, (0, common_1.Query)('locale')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createOnboardingLink", null);
__decorate([
    (0, common_1.Get)('connect/status'),
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifie le statut d\'un compte Stripe Connect' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut du compte' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "getConnectAccountStatus", null);
__decorate([
    (0, common_1.Get)('user/associations'),
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les associations d\'un utilisateur pour Stripe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des associations' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "getUserAssociations", null);
__decorate([
    (0, common_1.Post)('connect/create-account'),
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Crée un compte Stripe Connect pour une association' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Compte Stripe Connect créé' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "createConnectAccount", null);
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
        donation_service_1.DonationService,
        multi_tenant_stripe_service_1.MultiTenantStripeService,
        prisma_service_1.PrismaService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map