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
var TenantMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_service_1 = require("./tenant.service");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_context_1 = require("./tenant.context");
let TenantMiddleware = TenantMiddleware_1 = class TenantMiddleware {
    constructor(tenantService, prisma) {
        this.tenantService = tenantService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(TenantMiddleware_1.name);
    }
    async use(req, res, next) {
        const startTime = Date.now();
        this.logger.debug(`Middleware tenant - Chemin: ${req.path}, URL: ${req.url}`);
        try {
            const tenantIdentifier = this.extractTenantIdentifier(req);
            if (!tenantIdentifier) {
                this.logger.debug(`Aucun tenant requis pour ${req.path} - continuer sans contexte tenant`);
                return next();
            }
            const tenant = await this.tenantService.findByIdentifier(tenantIdentifier);
            if (!tenant) {
                this.logger.warn(`Tenant non trouvé: ${tenantIdentifier}`);
                throw new common_1.BadRequestException(`Tenant non trouvé: ${tenantIdentifier}`);
            }
            if (tenant.status !== 'ACTIVE') {
                this.logger.warn(`Tenant inactif: ${tenantIdentifier} (${tenant.status})`);
                throw new common_1.BadRequestException(`Tenant ${tenantIdentifier} est ${tenant.status.toLowerCase()}`);
            }
            const tenantPrisma = this.prisma.forTenant(tenant.id);
            req.tenant = {
                id: tenant.id,
                slug: tenant.slug,
                name: tenant.name,
                domain: tenant.domain || undefined,
                status: tenant.status,
            };
            const context = {
                tenant: req.tenant,
                prisma: tenantPrisma,
                startTime,
            };
            await tenant_context_1.tenantContext.run(context, async () => {
                this.logger.debug(`Contexte tenant établi: ${tenant.slug} (${tenant.id})`);
                next();
            });
        }
        catch (error) {
            this.logger.error('Erreur dans le middleware tenant:', error);
            if (error instanceof common_1.BadRequestException) {
                return res.status(400).json({
                    error: 'Tenant Error',
                    message: error.message,
                    statusCode: 400,
                });
            }
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Erreur lors de la résolution du tenant',
                statusCode: 500,
            });
        }
    }
    extractTenantIdentifier(req) {
        if (req.path.startsWith('/api/hub/') ||
            req.path.startsWith('/api/auth/') ||
            req.path.startsWith('/api/health') ||
            req.path === '/health') {
            this.logger.debug(`Route publique détectée: ${req.path} - pas de tenant requis`);
            return null;
        }
        const headerTenant = req.headers['x-tenant-id'];
        if (headerTenant) {
            this.logger.debug(`Tenant depuis header: ${headerTenant}`);
            return headerTenant;
        }
        const host = req.headers.host;
        if (host) {
            if (host.includes('localhost') || host.includes('127.0.0.1')) {
                this.logger.debug(`Environnement de développement détecté: ${host} - pas de tenant depuis sous-domaine`);
            }
            else {
                const subdomain = host.split('.')[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
                    this.logger.debug(`Tenant depuis sous-domaine: ${subdomain}`);
                    return subdomain;
                }
            }
        }
        const queryTenant = req.query.tenant;
        if (queryTenant) {
            this.logger.debug(`Tenant depuis query param: ${queryTenant}`);
            return queryTenant;
        }
        const pathMatch = req.path.match(/^\/api\/tenant\/([^\/]+)/);
        if (pathMatch) {
            const pathTenant = pathMatch[1];
            this.logger.debug(`Tenant depuis path: ${pathTenant}`);
            return pathTenant;
        }
        return null;
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = TenantMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_service_1.TenantService,
        prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map