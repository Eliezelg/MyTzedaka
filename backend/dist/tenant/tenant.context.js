"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantContext = void 0;
exports.getCurrentTenant = getCurrentTenant;
exports.getTenantPrisma = getTenantPrisma;
exports.hasTenantContext = hasTenantContext;
const async_hooks_1 = require("async_hooks");
exports.tenantContext = new async_hooks_1.AsyncLocalStorage();
function getCurrentTenant() {
    const context = exports.tenantContext.getStore();
    return context?.tenant || null;
}
function getTenantPrisma() {
    const context = exports.tenantContext.getStore();
    if (!context?.prisma) {
        throw new Error('Contexte tenant non disponible. Middleware tenant requis.');
    }
    return context.prisma;
}
function hasTenantContext() {
    return !!exports.tenantContext.getStore();
}
//# sourceMappingURL=tenant.context.js.map