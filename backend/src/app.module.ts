import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { AdminModule } from './admin/admin.module';
import { DeploymentModule } from './deployment/deployment.module';
import { HubModule } from './hub/hub.module';
import { S3Service } from './s3/s3.service';
import { DonorPortalModule } from './donor-portal/donor-portal.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    TenantModule,
    AuthModule,
    TestModule,
    AdminModule,
    DeploymentModule,
    HubModule,
    DonorPortalModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Exclure toutes les routes Hub Central cross-tenant
        { path: 'api/hub/(.*)', method: RequestMethod.ALL },
        // Routes d'authentification globales
        { path: 'api/auth/login', method: RequestMethod.POST },
        { path: 'api/auth/register', method: RequestMethod.POST },
        // Routes de santé
        { path: 'api/health', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}
