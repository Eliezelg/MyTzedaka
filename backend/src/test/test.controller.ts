import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantContext } from '../tenant/tenant.decorator';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tenant')
  getTenantInfo(@TenantContext() tenant: any) {
    return {
      success: true,
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('users')
  async getUsersByTenant(@TenantContext() tenant: any) {
    const result = await this.testService.getUsersByTenant(tenant.id);
    
    console.log('Service result:', JSON.stringify(result, null, 2));
    
    return result;
  }
}
