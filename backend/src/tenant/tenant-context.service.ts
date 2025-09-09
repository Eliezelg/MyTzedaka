import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  tenantSlug?: string;
  userId?: string;
  userRole?: string;
}

@Injectable()
export class TenantContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

  /**
   * Run a function with a specific tenant context
   */
  run<T>(context: TenantContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Get the current tenant context
   */
  getContext(): TenantContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  /**
   * Get the current tenant ID
   */
  getTenantId(): string | undefined {
    return this.getContext()?.tenantId;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  /**
   * Check if context exists
   */
  hasContext(): boolean {
    return this.getContext() !== undefined;
  }

  /**
   * Set tenant context (for middleware use)
   */
  setContext(context: TenantContext): void {
    this.asyncLocalStorage.enterWith(context);
  }
}