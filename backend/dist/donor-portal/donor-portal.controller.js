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
exports.DonorPortalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const donor_portal_service_1 = require("./donor-portal.service");
const donor_portal_dto_1 = require("./dto/donor-portal.dto");
let DonorPortalController = class DonorPortalController {
    constructor(donorPortalService) {
        this.donorPortalService = donorPortalService;
    }
    async getDonorProfile(email) {
        try {
            return await this.donorPortalService.findOrCreateDonorProfile(email);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la récupération du profil donateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createDonorProfile(createDto) {
        try {
            return await this.donorPortalService.createDonorProfile(createDto);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la création du profil donateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateDonorProfile(email, updateDto) {
        try {
            return await this.donorPortalService.updateDonorProfile(email, updateDto);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la mise à jour du profil donateur', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDonorHistory(donorProfileId, queryDto) {
        try {
            return await this.donorPortalService.getDonorHistory(donorProfileId, queryDto);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la récupération de l\'historique des dons', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFavoriteAssociations(donorProfileId) {
        try {
            return await this.donorPortalService.getFavoriteAssociations(donorProfileId);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la récupération des associations favorites', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async toggleFavoriteAssociation(donorProfileId, toggleDto) {
        try {
            return await this.donorPortalService.toggleFavoriteAssociation(donorProfileId, toggleDto.tenantId, toggleDto.action);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la mise à jour des favoris', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDonorStats(donorProfileId) {
        try {
            return await this.donorPortalService.getDonorStats(donorProfileId);
        }
        catch (error) {
            throw new common_1.HttpException('Erreur lors de la récupération des statistiques', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DonorPortalController = DonorPortalController;
__decorate([
    (0, common_1.Get)('profile/:email'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer le profil donateur par email' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: donor_portal_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "getDonorProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un profil donateur' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: donor_portal_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [donor_portal_dto_1.CreateDonorProfileDto]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "createDonorProfile", null);
__decorate([
    (0, common_1.Patch)('profile/:email'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le profil donateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: donor_portal_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Param)('email')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, donor_portal_dto_1.UpdateDonorProfileDto]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "updateDonorProfile", null);
__decorate([
    (0, common_1.Get)('history/:donorProfileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer l\'historique des dons cross-tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Historique des dons avec pagination' }),
    __param(0, (0, common_1.Param)('donorProfileId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, donor_portal_dto_1.DonorHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "getDonorHistory", null);
__decorate([
    (0, common_1.Get)('favorites/:donorProfileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les associations favorites' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des associations favorites' }),
    __param(0, (0, common_1.Param)('donorProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "getFavoriteAssociations", null);
__decorate([
    (0, common_1.Post)('favorites/:donorProfileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter/supprimer une association des favoris' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Association favorite mise à jour' }),
    __param(0, (0, common_1.Param)('donorProfileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, donor_portal_dto_1.ToggleFavoriteDto]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "toggleFavoriteAssociation", null);
__decorate([
    (0, common_1.Get)('stats/:donorProfileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques du donateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques globales du donateur' }),
    __param(0, (0, common_1.Param)('donorProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DonorPortalController.prototype, "getDonorStats", null);
exports.DonorPortalController = DonorPortalController = __decorate([
    (0, swagger_1.ApiTags)('donor-portal'),
    (0, common_1.Controller)('donor-portal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [donor_portal_service_1.DonorPortalService])
], DonorPortalController);
//# sourceMappingURL=donor-portal.controller.js.map