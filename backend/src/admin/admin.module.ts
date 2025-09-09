import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PageManagementService } from './page-management.service';
import { PageWidgetsService } from './page-widgets.service';
import { PageWidgetsController } from './page-widgets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AdminController, PageWidgetsController],
  providers: [AdminService, PageManagementService, PageWidgetsService],
  exports: [AdminService, PageManagementService, PageWidgetsService],
})
export class AdminModule {}
