import { Module } from '@nestjs/common';
import { DonorPortalController } from './donor-portal.controller';
import { DonorPortalService } from './donor-portal.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DonorPortalController],
  providers: [DonorPortalService],
  exports: [DonorPortalService]
})
export class DonorPortalModule {}
