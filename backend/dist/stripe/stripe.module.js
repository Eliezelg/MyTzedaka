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
const prisma_module_1 = require("../prisma/prisma.module");
const stripe_service_1 = require("./stripe.service");
const donation_service_1 = require("./donation.service");
const donation_controller_1 = require("./donation.controller");
const stripe_controller_1 = require("./stripe.controller");
const multi_tenant_stripe_service_1 = require("./multi-tenant-stripe.service");
const encryption_service_1 = require("./encryption.service");
const stripe_config_controller_1 = require("./stripe-config.controller");
const webhook_controller_1 = require("./webhook.controller");
let StripeModule = class StripeModule {
};
exports.StripeModule = StripeModule;
exports.StripeModule = StripeModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            stripe_service_1.StripeService,
            donation_service_1.DonationService,
            multi_tenant_stripe_service_1.MultiTenantStripeService,
            encryption_service_1.EncryptionService,
        ],
        controllers: [stripe_controller_1.StripeController, stripe_config_controller_1.StripeConfigController, donation_controller_1.DonationController, webhook_controller_1.StripeWebhookController],
        exports: [
            stripe_service_1.StripeService,
            donation_service_1.DonationService,
            multi_tenant_stripe_service_1.MultiTenantStripeService,
            encryption_service_1.EncryptionService,
        ],
    })
], StripeModule);
//# sourceMappingURL=stripe.module.js.map