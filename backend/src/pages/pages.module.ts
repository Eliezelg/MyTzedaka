import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesPublicController, PageWidgetsPublicController } from './pages-public.controller';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AdminModule, PrismaModule], // Import AdminModule to access PageManagementService
  controllers: [PagesController, PagesPublicController, PageWidgetsPublicController],
})
export class PagesModule {}