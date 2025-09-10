import { Module } from '@nestjs/common';
import { TenantAdminController } from './tenant-admin.controller';
import { TenantAdminService } from './tenant-admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantAdminController],
  providers: [TenantAdminService],
  exports: [TenantAdminService]
})
export class TenantAdminModule {}
