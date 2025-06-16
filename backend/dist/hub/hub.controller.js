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
const hub_jwt_auth_guard_1 = require("../auth/guards/hub-jwt-auth.guard");
const hub_dto_1 = require("./dto/hub.dto");
let HubController = class HubController {
    constructor(hubService) {
        this.hubService = hubService;
    }
    async getPublicAssociations() {
        return this.hubService.getPublicAssociations();
    }
    async getAssociationById(id) {
        return this.hubService.getAssociationById(id);
    }
    async getAssociationBySlug(slug) {
        return this.hubService.getAssociationBySlug(slug);
    }
    async getMyAssociations(req) {
        const userId = req.user.id;
        return this.hubService.getMyAssociations(userId);
    }
    async createAssociation(associationData, req) {
        const userId = req.user.id;
        return this.hubService.createAssociation({
            ...associationData,
            userId
        });
    }
    async updateAssociation(id, updateData) {
        console.log(' [PATCH /associations/:id] Mise à jour association:', { id, updateData });
        try {
            const updatedAssociation = await this.hubService.updateAssociation(id, updateData);
            console.log(' [PATCH /associations/:id] Association mise à jour:', updatedAssociation.id);
            return updatedAssociation;
        }
        catch (error) {
            console.error(' [PATCH /associations/:id] Erreur:', error.message);
            throw error;
        }
    }
    async getGlobalStats() {
        return this.hubService.getGlobalStats();
    }
    async getPopularCampaigns(limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.hubService.getPopularCampaigns(limitNumber);
    }
    async getCampaigns(query) {
        return this.hubService.getCampaigns(query);
    }
    async getCampaignById(id) {
        return this.hubService.getCampaignById(id);
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
    async testStripe() {
        return { message: 'Route Stripe fonctionnelle' };
    }
    async getTenantStripePublishableKey(tenantId) {
        return this.hubService.getTenantStripePublishableKey(tenantId);
    }
    async createTestUser(userData) {
        return this.hubService.createTestUser(userData);
    }
    async getAssociationAdmins(tenantId) {
        return this.hubService.getAssociationAdmins(tenantId);
    }
    async addAssociationAdmin(tenantId, adminData) {
        return this.hubService.addAssociationAdmin(tenantId, adminData);
    }
    async removeAssociationAdmin(tenantId, userId) {
        return this.hubService.removeAssociationAdmin(tenantId, userId);
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
    (0, common_1.Get)('associations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les détails d\'une association' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de l\'association' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Association non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getAssociationById", null);
__decorate([
    (0, common_1.Get)('associations/by-slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les détails d\'une association par slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de l\'association' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Association non trouvée' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getAssociationBySlug", null);
__decorate([
    (0, common_1.Get)('my-associations'),
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les associations de l\'utilisateur connecté' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des associations dont l\'utilisateur est membre/admin' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getMyAssociations", null);
__decorate([
    (0, common_1.Post)('associations'),
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crée une nouvelle association' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Association créée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non authentifié' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "createAssociation", null);
__decorate([
    (0, common_1.Patch)('associations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour une association' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de l\'association' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Association mise à jour avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Association non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "updateAssociation", null);
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
    (0, common_1.Get)('campaigns'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les campagnes publiques avec pagination et filtres' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page (défaut: 12, max: 50)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Recherche textuelle' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String, description: 'Filtrer par catégorie' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, description: 'Statut de la campagne (défaut: ACTIVE)' }),
    (0, swagger_1.ApiQuery)({ name: 'featured', required: false, type: Boolean, description: 'Campagnes mises en avant' }),
    (0, swagger_1.ApiQuery)({ name: 'urgent', required: false, type: Boolean, description: 'Campagnes urgentes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste paginée des campagnes' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)('campaigns/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère les détails d\'une campagne' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de la campagne' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campagne non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getCampaignById", null);
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
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
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
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
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
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
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
    (0, common_1.UseGuards)(hub_jwt_auth_guard_1.HubJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Met à jour les statistiques globales d\'un donateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: hub_dto_1.DonorProfileDto }),
    __param(0, (0, common_1.Param)('donorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "updateDonorGlobalStats", null);
__decorate([
    (0, common_1.Get)('test-stripe'),
    (0, swagger_1.ApiOperation)({ summary: 'Test route Stripe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HubController.prototype, "testStripe", null);
__decorate([
    (0, common_1.Get)('stripe/:tenantId/publishable-key'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère la clé publique Stripe pour un tenant (route publique)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clé publique Stripe' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getTenantStripePublishableKey", null);
__decorate([
    (0, common_1.Post)('test-user'),
    (0, swagger_1.ApiOperation)({ summary: 'Crée un utilisateur de test (développement uniquement)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "createTestUser", null);
__decorate([
    (0, common_1.Get)('associations/:tenantId/admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupère la liste des administrateurs d\'une association' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "getAssociationAdmins", null);
__decorate([
    (0, common_1.Post)('associations/:tenantId/admins'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajoute un administrateur à une association' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "addAssociationAdmin", null);
__decorate([
    (0, common_1.Delete)('associations/:tenantId/admins/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Retire un administrateur d\'une association' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "removeAssociationAdmin", null);
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