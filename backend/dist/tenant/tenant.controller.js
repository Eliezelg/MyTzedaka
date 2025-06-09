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
exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const tenant_service_1 = require("./tenant.service");
const tenant_context_1 = require("./tenant.context");
let TenantController = class TenantController {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    getCurrentTenantInfo(req) {
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        return {
            tenant,
            headers: {
                host: req.headers.host,
                'x-tenant-id': req.headers['x-tenant-id'],
            },
            timestamp: new Date().toISOString(),
        };
    }
    async getTenant(slug) {
        return await this.tenantService.findByIdentifier(slug);
    }
    async createTenant(data) {
        return await this.tenantService.createTenant(data);
    }
    async updateTenant(id, data) {
        return await this.tenantService.updateTenant(id, data);
    }
    async deleteTenant(id) {
        await this.tenantService.deleteTenant(id);
        return { message: 'Tenant supprimé avec succès' };
    }
    healthCheck(req) {
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        return {
            status: 'OK',
            message: 'Tenant middleware actif',
            tenant: tenant ? {
                id: tenant.id,
                slug: tenant.slug,
                name: tenant.name,
            } : null,
            identificationMethods: {
                header: req.headers['x-tenant-id'],
                subdomain: req.headers.host?.split('.')[0],
                query: req.query.tenant,
                path: req.path.match(/^\/api\/tenant\/([^\/]+)/) ? req.path.match(/^\/api\/tenant\/([^\/]+)/)[1] : null,
            },
            timestamp: new Date().toISOString(),
        };
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "getCurrentTenantInfo", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getTenant", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateTenant", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "deleteTenant", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantController.prototype, "healthCheck", null);
exports.TenantController = TenantController = __decorate([
    (0, common_1.Controller)('tenant'),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map