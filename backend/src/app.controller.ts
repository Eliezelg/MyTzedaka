import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { getCurrentTenant, getTenantPrisma } from './tenant/tenant.context';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    };
  }

  @Get('test/tenant')
  getCurrentTenantInfo(@Req() req: Request) {
    const tenant = getCurrentTenant();
    
    return {
      status: 'OK',
      message: 'Test du middleware tenant',
      tenant: tenant ? {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      } : null,
      identificationMethods: {
        header: req.headers['x-tenant-id'],
        subdomain: req.headers.host?.split('.')[0],
        query: req.query.tenant,
        path: req.path.match(/^\/api\/tenant\/([^\/]+)/) ? req.path.match(/^\/api\/tenant\/([^\/]+)/)![1] : null,
      },
      request: {
        url: req.url,
        path: req.path,
        host: req.headers.host,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test/users')
  async getUsersForTenant() {
    try {
      const tenant = getCurrentTenant();
      if (!tenant) {
        return { error: 'Aucun tenant actif' };
      }

      const prisma = getTenantPrisma();
      const users = await prisma.user.findMany({
        where: { tenantId: tenant.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
        }
      });

      return {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
        },
        users,
        count: users.length,
      };
    } catch (error) {
      return {
        error: 'Erreur lors de la récupération des utilisateurs',
        details: error.message,
      };
    }
  }
}
