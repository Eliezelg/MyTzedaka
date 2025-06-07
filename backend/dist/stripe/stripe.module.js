"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_service_1 = require("./stripe.service");
const stripe_controller_1 = require("./stripe.controller");
const donation_service_1 = require("./donation.service");
const donation_controller_1 = require("./donation.controller");
const multi_tenant_stripe_service_1 = require("./multi-tenant-stripe.service");
const stripe_config_controller_1 = require("./stripe-config.controller");
const encryption_service_1 = require("./encryption.service");
const prisma_module_1 = require("../prisma/prisma.module");
let StripeModule = class StripeModule {
};
exports.StripeModule = StripeModule;
exports.StripeModule = StripeModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
        controllers: [stripe_controller_1.StripeController, donation_controller_1.DonationController, stripe_config_controller_1.StripeConfigController],
        providers: [stripe_service_1.StripeService, donation_service_1.DonationService, multi_tenant_stripe_service_1.MultiTenantStripeService, encryption_service_1.EncryptionService],
        exports: [stripe_service_1.StripeService, donation_service_1.DonationService, multi_tenant_stripe_service_1.MultiTenantStripeService, encryption_service_1.EncryptionService],
    })
], StripeModule);
//# sourceMappingURL=stripe.module.js.map