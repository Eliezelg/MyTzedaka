import { Module } from '@nestjs/common';
import { DonorPortalController } from './donor-portal.controller';
import { DonorPortalService } from './donor-portal.service';

@Module({
  controllers: [DonorPortalController],
  providers: [DonorPortalService]
})
export class DonorPortalModule {}
