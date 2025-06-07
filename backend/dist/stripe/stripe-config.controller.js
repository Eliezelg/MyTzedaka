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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const multi_tenant_stripe_service_1 = require("./multi-tenant-stripe.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
class ConfigureStripeDto {
}
class StripeOnboardingDto {
}
let StripeConfigController = class StripeConfigController {
    constructor(stripeService, prisma) {
        this.stripeService = stripeService;
        this.prisma = prisma;
    }
    async getStripeConfig(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { stripeAccount: true },
        });
        if (!tenant) {
            throw new Error('Tenant non trouvé');
        }
        const config = {
            mode: tenant.stripeMode,
            isConfigured: !!tenant.stripeAccount,
            ...(tenant.stripeAccount && {
                accountName: tenant.stripeAccount.stripeAccountName,
                accountEmail: tenant.stripeAccount.stripeAccountEmail,
                currency: tenant.stripeAccount.currency,
                feePercentage: tenant.stripeAccount.feePercentage,
                isActive: tenant.stripeAccount.isActive,
                connectStatus: tenant.stripeAccount.stripeConnectStatus,
                lastVerifiedAt: tenant.stripeAccount.lastVerifiedAt,
            }),
        };
        return config;
    }
    async configureStripe(tenantId, dto) {
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { stripeMode: dto.mode },
        });
        if (dto.mode === 'PLATFORM') {
            if (!dto.email || !dto.businessName) {
                throw new Error('Email et nom d\'entreprise requis pour Stripe Connect');
            }
            const account = await this.stripeService.createConnectAccount(tenantId, dto.email, dto.businessName);
            return {
                success: true,
                accountId: account.id,
                message: 'Compte Stripe Connect créé. Veuillez compléter l\'onboarding.',
            };
        }
        else if (dto.mode === 'CUSTOM') {
            if (!dto.publishableKey || !dto.secretKey) {
                throw new Error('Clés Stripe requises pour le mode custom');
            }
            await this.stripeService.configureCustomStripeAccount(tenantId, dto.publishableKey, dto.secretKey, dto.webhookSecret);
            return {
                success: true,
                message: 'Compte Stripe custom configuré avec succès.',
            };
        }
    }
    async createOnboardingLink(tenantId, dto) {
        const accountLink = await this.stripeService.createConnectOnboardingLink(tenantId, dto.returnUrl, dto.refreshUrl);
        return {
            url: accountLink.url,
            expiresAt: accountLink.expires_at,
        };
    }
    async getPublishableKey(tenantId) {
        const publishableKey = await this.stripeService.getPublishableKey(tenantId);
        return {
            publishableKey,
        };
    }
    async handleWebhook(tenantId, req) {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            throw new Error('Signature Stripe manquante');
        }
        const event = await this.stripeService.handleWebhook(tenantId, req.rawBody, signature);
        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('Paiement réussi:', event.data.object);
                break;
            case 'payment_intent.payment_failed':
                console.log('Paiement échoué:', event.data.object);
                break;
            case 'account.updated':
                if (event.account) {
                    const stripeAccount = await this.prisma.stripeAccount.findFirst({
                        where: {
                            stripeConnectAccountId: event.account,
                        },
                    });
                    if (stripeAccount) {
                        await this.prisma.stripeAccount.update({
                            where: {
                                id: stripeAccount.id,
                            },
                            data: {
                                stripeConnectStatus: 'active',
                                lastVerifiedAt: new Date(),
                            },
                        });
                    }
                }
                break;
        }
        return { received: true };
    }
};
exports.StripeConfigController = StripeConfigController;
__decorate([
    (0, common_1.Get)('/:tenantId/config'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère la configuration Stripe d\'un tenant' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StripeConfigController.prototype, "getStripeConfig", null);
__decorate([
    (0, common_1.Post)('/:tenantId/configure'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Configure le mode Stripe pour un tenant' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConfigureStripeDto]),
    __metadata("design:returntype", Promise)
], StripeConfigController.prototype, "configureStripe", null);
__decorate([
    (0, common_1.Post)('/:tenantId/connect/onboarding'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Génère un lien d\'onboarding Stripe Connect' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, StripeOnboardingDto]),
    __metadata("design:returntype", Promise)
], StripeConfigController.prototype, "createOnboardingLink", null);
__decorate([
    (0, common_1.Get)('/:tenantId/publishable-key'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère la clé publique Stripe pour le frontend' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StripeConfigController.prototype, "getPublishableKey", null);
__decorate([
    (0, common_1.Post)('/:tenantId/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Endpoint webhook Stripe par tenant' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StripeConfigController.prototype, "handleWebhook", null);
exports.StripeConfigController = StripeConfigController = __decorate([
    (0, swagger_1.ApiTags)('stripe-config'),
    (0, common_1.Controller)('api/stripe-config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [multi_tenant_stripe_service_1.MultiTenantStripeService,
        prisma_service_1.PrismaService])
], StripeConfigController);
//# sourceMappingURL=stripe-config.controller.js.map