import { AsyncLocalStorage } from 'async_hooks';
export interface TenantContext {
    tenant: {
        id: string;
        slug: string;
        name: string;
        domain?: string;
        status: string;
    };
    prisma: any;
    startTime: number;
}
export declare const tenantContext: AsyncLocalStorage<TenantContext>;
export declare function getCurrentTenant(): TenantContext['tenant'] | null;
export declare function getTenantPrisma(): any;
export declare function hasTenantContext(): boolean;
