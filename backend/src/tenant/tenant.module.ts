import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { FileUploadService } from './file-upload.service';
import { TenantMiddleware } from './tenant.middleware';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TenantService, FileUploadService],
  controllers: [TenantController], 
  exports: [TenantService, FileUploadService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Appliquer à toutes les routes
  }
}
