import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController, DonationController],
  providers: [StripeService, DonationService],
  exports: [StripeService, DonationService],
})
export class StripeModule {}
