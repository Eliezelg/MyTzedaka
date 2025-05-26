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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getAdminStats() {
        return this.adminService.getAdminStats();
    }
    async getTenants(query) {
        return this.adminService.getTenants(query);
    }
    async getTenantById(id) {
        return this.adminService.getTenantById(id);
    }
    async createTenant(createTenantDto) {
        return this.adminService.createTenant(createTenantDto);
    }
    async updateTenant(id, updateTenantDto) {
        return this.adminService.updateTenant(id, updateTenantDto);
    }
    async deleteTenant(id) {
        return this.adminService.deleteTenant(id);
    }
    async deployTenant(id, deploymentDto) {
        return {
            message: 'Déploiement initié',
            tenantId: id,
            deploymentId: 'deploy-' + Date.now(),
            status: 'IN_PROGRESS'
        };
    }
    async getTenantUsers(id) {
        return {
            users: [],
            total: 0
        };
    }
    async getTenantAnalytics(id) {
        return {
            tenantId: id,
            metrics: {
                donations: { total: 0, thisMonth: 0 },
                users: { total: 0, active: 0 },
                campaigns: { total: 0, active: 0 }
            }
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les statistiques admin globales' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques récupérées', type: admin_dto_1.AdminStatsDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les tenants avec pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des tenants', type: [admin_dto_1.TenantResponseDto] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.TenantListQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenants", null);
__decorate([
    (0, common_1.Get)('tenants/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir un tenant par ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant trouvé', type: admin_dto_1.TenantResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenantById", null);
__decorate([
    (0, common_1.Post)('tenants'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un nouveau tenant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tenant créé', type: admin_dto_1.TenantResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflit - slug ou domaine déjà existant' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Put)('tenants/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant mis à jour', type: admin_dto_1.TenantResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)('tenants/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un tenant' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Tenant supprimé' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Impossible de supprimer - données actives' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Post)('tenants/:id/deploy'),
    (0, swagger_1.ApiOperation)({ summary: 'Déployer le frontend d\'un tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Déploiement initié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.DeploymentDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deployTenant", null);
__decorate([
    (0, common_1.Get)('tenants/:id/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les utilisateurs d\'un tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenantUsers", null);
__decorate([
    (0, common_1.Get)('tenants/:id/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir les analytics d\'un tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics du tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTenantAnalytics", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map