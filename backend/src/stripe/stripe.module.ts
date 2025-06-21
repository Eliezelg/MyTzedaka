import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeService } from './stripe.service';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { StripeController } from './stripe.controller';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { EncryptionService } from './encryption.service';
import { StripeConfigController } from './stripe-config.controller';
import { StripeWebhookController } from './webhook.controller';
import { TaxReceiptModule } from '../tax-receipt/tax-receipt.module';

@Module({
  imports: [PrismaModule, forwardRef(() => TaxReceiptModule)],
  providers: [
    StripeService,
    DonationService,
    MultiTenantStripeService,
    EncryptionService,
  ],
  controllers: [StripeController, StripeConfigController, DonationController, StripeWebhookController],
  exports: [
    StripeService,
    DonationService,
    MultiTenantStripeService,
    EncryptionService,
  ],
})
export class StripeModule {}
