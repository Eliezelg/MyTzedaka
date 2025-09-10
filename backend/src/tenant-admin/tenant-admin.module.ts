import { Module } from '@nestjs/common';
import { TenantAdminController } from './tenant-admin.controller';
import { TenantAdminService } from './tenant-admin.service';
import { TenantDataController } from './tenant-data.controller';
import { TenantDataService } from './tenant-data.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantAdminController, TenantDataController],
  providers: [TenantAdminService, TenantDataService],
  exports: [TenantAdminService, TenantDataService]
})
export class TenantAdminModule {}
