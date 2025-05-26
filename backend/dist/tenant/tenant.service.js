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
var TenantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantService = TenantService_1 = class TenantService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(TenantService_1.name);
        this.cache = new Map();
    }
    async findByIdentifier(identifier) {
        try {
            const cacheKey = `tenant:${identifier}`;
            if (this.cache.has(cacheKey)) {
                this.logger.debug(`Tenant trouvé en cache: ${identifier}`);
                return this.cache.get(cacheKey);
            }
            const tenant = await this.prisma.tenant.findFirst({
                where: {
                    OR: [
                        { slug: identifier },
                        { domain: identifier }
                    ]
                }
            });
            if (tenant) {
                this.cache.set(cacheKey, tenant);
                setTimeout(() => {
                    this.cache.delete(cacheKey);
                }, 5 * 60 * 1000);
                this.logger.debug(`Tenant trouvé: ${tenant.slug} (${tenant.id})`);
            }
            else {
                this.logger.warn(`Tenant non trouvé: ${identifier}`);
            }
            return tenant;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la recherche du tenant ${identifier}:`, error);
            return null;
        }
    }
    async findById(id) {
        try {
            return await this.prisma.tenant.findUnique({
                where: { id }
            });
        }
        catch (error) {
            this.logger.error(`Erreur lors de la recherche du tenant par ID ${id}:`, error);
            return null;
        }
    }
    async createTenant(data) {
        try {
            const tenant = await this.prisma.tenant.create({
                data: {
                    slug: data.slug,
                    name: data.name,
                    domain: data.domain,
                    theme: data.theme || {},
                    settings: data.settings || {},
                    status: 'ACTIVE'
                }
            });
            this.logger.log(`Nouveau tenant créé: ${tenant.slug} (${tenant.id})`);
            return tenant;
        }
        catch (error) {
            this.logger.error('Erreur lors de la création du tenant:', error);
            throw error;
        }
    }
    async updateTenant(id, data) {
        try {
            const tenant = await this.prisma.tenant.update({
                where: { id },
                data
            });
            this.invalidateCache(tenant.slug);
            if (tenant.domain) {
                this.invalidateCache(tenant.domain);
            }
            this.logger.log(`Tenant mis à jour: ${tenant.slug} (${tenant.id})`);
            return tenant;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la mise à jour du tenant ${id}:`, error);
            throw error;
        }
    }
    async deleteTenant(id) {
        try {
            const tenant = await this.findById(id);
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant ${id} non trouvé`);
            }
            await this.prisma.tenant.update({
                where: { id },
                data: { status: 'DELETED' }
            });
            this.invalidateCache(tenant.slug);
            if (tenant.domain) {
                this.invalidateCache(tenant.domain);
            }
            this.logger.log(`Tenant supprimé: ${tenant.slug} (${tenant.id})`);
        }
        catch (error) {
            this.logger.error(`Erreur lors de la suppression du tenant ${id}:`, error);
            throw error;
        }
    }
    invalidateCache(identifier) {
        const cacheKey = `tenant:${identifier}`;
        this.cache.delete(cacheKey);
    }
    clearCache() {
        this.cache.clear();
        this.logger.log('Cache tenant nettoyé');
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = TenantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map