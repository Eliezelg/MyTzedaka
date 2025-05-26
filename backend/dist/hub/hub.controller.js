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
exports.HubController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hub_service_1 = require("./hub.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const hub_dto_1 = require("./dto/hub.dto");
let HubController = class HubController {
    constructor(hubService) {
        this.hubService = hubService;
    }
    async getPublicAssociations() {
        return this.hubService.getPublicAssociations();
    }
    async getGlobalStats() {
        return this.hubService.getGlobalStats();
    }
    async getPopularCampaigns(limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.hubService.getPopularCampaigns(limitNumber);
    }
    async searchAssociations(searchDto) {
        return this.hubService.searchAssociations(searchDto);
    }
    async createOrUpdateDonorProfile(donorData) {
        return this.hubService.findOrCreateDonorProfile(donorData);
    }
    async recordDonorActivity(donorId, activityData) {
        return this.hubService.recordTenantActivity(donorId, activityData.tenantId, {
            tenantId: activityData.tenantId,
            donationAmount: activityData.donationAmount,
            isFavorite: activityData.isFavorite
        });
    }
    async getDonorGlobalHistory(donorId) {
        return this.hubService.getDonorGlobalHistory(donorId);
    }
    async updateDonorGlobalStats(donorId) {
        return this.hubService.updateDonorGlobalStats(donorId);
    }
    async test() {
        return { message: 'Hub Controller fonctionne !', timestamp: new Date().toISOString() };
    }
};
exports.HubController = HubController;
__decorate([
    (0, common_1.Get)('associations'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère toutes les associations publiques' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des associations publiques' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getPublicAssociations", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les statistiques globales du hub' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: hub_dto_1.HubStatsDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Get)('campaigns/popular'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les campagnes populaires cross-tenant' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Campagnes populaires' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getPopularCampaigns", null);
__decorate([
    (0, common_1.Get)('associations/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Recherche d\'associations avec pagination et filtres' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Associations trouvées avec pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hub_dto_1.AssociationSearchDto]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "searchAssociations", null);
__decorate([
    (0, common_1.Post)('donor/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crée ou met à jour un profil donateur global' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: hub_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "createOrUpdateDonorProfile", null);
__decorate([
    (0, common_1.Post)('donor/:donorId/activity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistre une activité cross-tenant pour un donateur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Activité enregistrée' }),
    __param(0, (0, common_1.Param)('donorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "recordDonorActivity", null);
__decorate([
    (0, common_1.Get)('donor/:donorId/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère l\'historique global d\'un donateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: hub_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Param)('donorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getDonorGlobalHistory", null);
__decorate([
    (0, common_1.Post)('donor/:donorId/update-stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Met à jour les statistiques globales d\'un donateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: hub_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Param)('donorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "updateDonorGlobalStats", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HubController.prototype, "test", null);
exports.HubController = HubController = __decorate([
    (0, swagger_1.ApiTags)('Hub Central'),
    (0, common_1.Controller)('hub'),
    __metadata("design:paramtypes", [hub_service_1.HubService])
], HubController);
//# sourceMappingURL=hub.controller.js.map