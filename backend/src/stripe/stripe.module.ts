import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { StripeConfigController } from './stripe-config.controller';
import { EncryptionService } from './encryption.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [StripeController, DonationController, StripeConfigController],
  providers: [StripeService, DonationService, MultiTenantStripeService, EncryptionService],
  exports: [StripeService, DonationService, MultiTenantStripeService, EncryptionService],
})
export class StripeModule {}
