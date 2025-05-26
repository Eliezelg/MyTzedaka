import { Controller, Get, Post, Body, Param, Put, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { TenantService } from './tenant.service';
import { getCurrentTenant } from './tenant.context';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('current')
  getCurrentTenantInfo(@Req() req: Request) {
    const tenant = getCurrentTenant();
    
    return {
      tenant,
      headers: {
        host: req.headers.host,
        'x-tenant-id': req.headers['x-tenant-id'],
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':slug')
  async getTenant(@Param('slug') slug: string) {
    return await this.tenantService.findByIdentifier(slug);
  }

  @Post()
  async createTenant(@Body() data: {
    slug: string;
    name: string;
    domain?: string;
    theme?: any;
    settings?: any;
  }) {
    return await this.tenantService.createTenant(data);
  }

  @Put(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return await this.tenantService.updateTenant(id, data);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string) {
    await this.tenantService.deleteTenant(id);
    return { message: 'Tenant supprimé avec succès' };
  }

  @Get()
  healthCheck(@Req() req: Request) {
    const tenant = getCurrentTenant();
    
    return {
      status: 'OK',
      message: 'Tenant middleware actif',
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
      timestamp: new Date().toISOString(),
    };
  }
}
