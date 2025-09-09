import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantModulesService } from './tenant-modules.service';
import { TenantController } from './tenant.controller';
import { TenantTemplatesController } from './tenant-templates.controller';
import { ZmanimController } from './zmanim.controller';
import { PrayersController } from './prayers.controller';
import { TenantParnassController } from './parnass.controller';
import { FileUploadService } from './file-upload.service';
import { SiteTemplatesService } from './site-templates.service';
import { ZmanimService } from './zmanim.service';
import { PrayersService } from './prayers.service';
import { TenantContextService } from './tenant-context.service';
import { TenantMiddleware } from './tenant.middleware';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModule } from '../admin/admin.module';
import { ParnassModule } from '../parnass/parnass.module';

@Module({
  imports: [PrismaModule, AdminModule, ParnassModule],
  providers: [
    TenantService, 
    TenantModulesService, 
    FileUploadService, 
    SiteTemplatesService, 
    ZmanimService,
    PrayersService,
    TenantContextService
  ],
  controllers: [TenantController, TenantTemplatesController, ZmanimController, PrayersController, TenantParnassController], 
  exports: [
    TenantService, 
    TenantModulesService, 
    FileUploadService, 
    SiteTemplatesService, 
    ZmanimService,
    PrayersService,
    TenantContextService
  ],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Appliquer à toutes les routes
  }
}
