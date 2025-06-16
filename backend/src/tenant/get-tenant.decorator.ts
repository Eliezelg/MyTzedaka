import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getCurrentTenant } from './tenant.context';

export const GetTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const currentTenant = getCurrentTenant();
    if (!currentTenant) {
      throw new Error('Tenant context not found');
    }
    return currentTenant.id;
  },
);