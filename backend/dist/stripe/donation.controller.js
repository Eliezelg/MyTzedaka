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
var DonationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_hub_decorator_1 = require("../common/decorators/public-hub.decorator");
const donation_service_1 = require("./donation.service");
let DonationController = DonationController_1 = class DonationController {
    constructor(donationService) {
        this.donationService = donationService;
        this.logger = new common_1.Logger(DonationController_1.name);
    }
    async createDonation(req, createDonationDto) {
        const { tenantId, userId } = req.user;
        this.logger.log(`Creating donation: ${createDonationDto.amount}€ for user ${userId} in tenant ${tenantId}`);
        const result = await this.donationService.createDonation(tenantId, userId, createDonationDto);
        return {
            success: true,
            data: {
                donationId: result.donation.id,
                clientSecret: result.clientSecret,
                amount: result.donation.amount,
                currency: result.donation.currency,
                campaign: result.donation.campaign,
            },
        };
    }
    async createPublicDonation(createDonationDto) {
        const { tenantId, ...donationData } = createDonationDto;
        if (!tenantId) {
            throw new common_1.BadRequestException('tenantId est requis pour une donation publique');
        }
        this.logger.log(`Creating public donation: ${donationData.amount}€ for tenant ${tenantId}`);
        const result = await this.donationService.createDonation(tenantId, null, donationData);
        return {
            success: true,
            data: {
                donationId: result.donation.id,
                clientSecret: result.clientSecret,
                amount: result.donation.amount,
                currency: result.donation.currency,
            },
        };
    }
    async confirmDonation(req, paymentIntentId) {
        this.logger.log(`Confirming donation for PaymentIntent: ${paymentIntentId}`);
        const donation = await this.donationService.confirmDonation(paymentIntentId);
        return {
            success: true,
            data: {
                donationId: donation.id,
                amount: donation.amount,
                status: donation.status,
                campaign: donation.campaign,
            },
        };
    }
    async confirmPublicDonation(paymentIntentId) {
        this.logger.log(`Confirming public donation for PaymentIntent: ${paymentIntentId}`);
        const donation = await this.donationService.confirmDonation(paymentIntentId);
        return {
            success: true,
            data: {
                donationId: donation.id,
                amount: donation.amount,
                currency: donation.currency,
                status: donation.status,
            },
        };
    }
    async getDonationHistory(req, limit, offset, tenantId) {
        const { userId } = req.user;
        const parsedLimit = limit ? parseInt(limit, 10) : 20;
        const parsedOffset = offset ? parseInt(offset, 10) : 0;
        this.logger.log(`Getting donation history for user ${userId}`);
        const result = await this.donationService.getDonationHistory(userId, tenantId, parsedLimit, parsedOffset);
        return {
            success: true,
            data: result.donations,
            pagination: {
                total: result.total,
                limit: parsedLimit,
                offset: parsedOffset,
                hasMore: result.total > parsedOffset + parsedLimit,
            },
        };
    }
    async getCampaignDonations(req, campaignId, limit) {
        const { tenantId } = req.user;
        const parsedLimit = limit ? parseInt(limit, 10) : 50;
        this.logger.log(`Getting donations for campaign ${campaignId}`);
        const donations = await this.donationService.getCampaignDonations(campaignId, tenantId, parsedLimit);
        return {
            success: true,
            data: donations,
        };
    }
    async getCampaignDonationStats(req, campaignId) {
        const { tenantId } = req.user;
        this.logger.log(`Getting donation stats for campaign ${campaignId}`);
        const stats = await this.donationService.getCampaignDonationStats(campaignId, tenantId);
        return {
            success: true,
            data: stats,
        };
    }
};
exports.DonationController = DonationController;
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une donation avec PaymentIntent' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Donation créée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campagne non trouvée' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "createDonation", null);
__decorate([
    (0, public_hub_decorator_1.PublicHub)(),
    (0, common_1.Post)('create-public'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une donation publique depuis le hub (sans authentification)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Donation créée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campagne non trouvée' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "createPublicDonation", null);
__decorate([
    (0, common_1.Post)('confirm/:paymentIntentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmer une donation après paiement réussi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation confirmée' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Paiement non confirmé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Donation non trouvée' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('paymentIntentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "confirmDonation", null);
__decorate([
    (0, public_hub_decorator_1.PublicHub)(),
    (0, common_1.Post)('confirm-public/:paymentIntentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmer une donation publique après paiement réussi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donation confirmée' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Paiement non confirmé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Donation non trouvée' }),
    __param(0, (0, common_1.Param)('paymentIntentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "confirmPublicDonation", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer l\'historique des donations de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique récupéré' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "getDonationHistory", null);
__decorate([
    (0, common_1.Get)('campaign/:campaignId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les donations d\'une campagne' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donations de la campagne' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "getCampaignDonations", null);
__decorate([
    (0, common_1.Get)('campaign/:campaignId/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des donations d\'une campagne' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques de la campagne' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DonationController.prototype, "getCampaignDonationStats", null);
exports.DonationController = DonationController = DonationController_1 = __decorate([
    (0, swagger_1.ApiTags)('Donations'),
    (0, common_1.Controller)('donations'),
    __metadata("design:paramtypes", [donation_service_1.DonationService])
], DonationController);
//# sourceMappingURL=donation.controller.js.map