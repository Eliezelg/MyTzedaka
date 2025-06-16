"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenant = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_1 = require("./tenant.context");
exports.GetTenant = (0, common_1.createParamDecorator)((data, ctx) => {
    const currentTenant = (0, tenant_context_1.getCurrentTenant)();
    if (!currentTenant) {
        throw new Error('Tenant context not found');
    }
    return currentTenant.id;
});
//# sourceMappingURL=get-tenant.decorator.js.map