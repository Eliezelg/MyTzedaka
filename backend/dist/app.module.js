"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const tenant_module_1 = require("./tenant/tenant.module");
const auth_module_1 = require("./auth/auth.module");
const test_module_1 = require("./test/test.module");
const tenant_middleware_1 = require("./tenant/tenant.middleware");
const admin_module_1 = require("./admin/admin.module");
const deployment_module_1 = require("./deployment/deployment.module");
const hub_module_1 = require("./hub/hub.module");
const s3_service_1 = require("./s3/s3.service");
const donor_portal_module_1 = require("./donor-portal/donor-portal.module");
const stripe_module_1 = require("./stripe/stripe.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .exclude({ path: 'api/hub/(.*)', method: common_1.RequestMethod.ALL }, { path: 'api/auth/login', method: common_1.RequestMethod.POST }, { path: 'api/auth/register', method: common_1.RequestMethod.POST }, { path: 'api/health', method: common_1.RequestMethod.GET }, { path: 'health', method: common_1.RequestMethod.GET })
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            tenant_module_1.TenantModule,
            auth_module_1.AuthModule,
            test_module_1.TestModule,
            admin_module_1.AdminModule,
            deployment_module_1.DeploymentModule,
            hub_module_1.HubModule,
            donor_portal_module_1.DonorPortalModule,
            stripe_module_1.StripeModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, s3_service_1.S3Service],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map