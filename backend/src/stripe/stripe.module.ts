import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeService } from './stripe.service';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { EncryptionService } from './encryption.service';
import { StripeConfigController } from './stripe-config.controller';
import { StripeWebhookController } from './webhook.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    StripeService,
    DonationService,
    MultiTenantStripeService,
    EncryptionService,
  ],
  controllers: [StripeConfigController, DonationController, StripeWebhookController],
  exports: [
    StripeService,
    DonationService,
    MultiTenantStripeService,
    EncryptionService,
  ],
})
export class StripeModule {}
