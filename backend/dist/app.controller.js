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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const tenant_context_1 = require("./tenant/tenant.context");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    getHealth() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            version: '1.0.0'
        };
    }
    getCurrentTenantInfo(req) {
        const tenant = (0, tenant_context_1.getCurrentTenant)();
        return {
            status: 'OK',
            message: 'Test du middleware tenant',
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
            request: {
                url: req.url,
                path: req.path,
                host: req.headers.host,
            },
            timestamp: new Date().toISOString(),
        };
    }
    async getUsersForTenant() {
        try {
            const tenant = (0, tenant_context_1.getCurrentTenant)();
            if (!tenant) {
                return { error: 'Aucun tenant actif' };
            }
            const prisma = (0, tenant_context_1.getTenantPrisma)();
            const users = await prisma.user.findMany({
                where: { tenantId: tenant.id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    tenantId: true,
                }
            });
            return {
                tenant: {
                    id: tenant.id,
                    slug: tenant.slug,
                    name: tenant.name,
                },
                users,
                count: users.length,
            };
        }
        catch (error) {
            return {
                error: 'Erreur lors de la récupération des utilisateurs',
                details: error.message,
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('test/tenant'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getCurrentTenantInfo", null);
__decorate([
    (0, common_1.Get)('test/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getUsersForTenant", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map