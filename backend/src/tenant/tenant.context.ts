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

// Contexte global pour le tenant avec AsyncLocalStorage
export const tenantContext = new AsyncLocalStorage<TenantContext>();

// Decorator pour récupérer le tenant actuel
export function getCurrentTenant(): TenantContext['tenant'] | null {
  const context = tenantContext.getStore();
  return context?.tenant || null;
}

// Decorator pour récupérer le Prisma tenant-aware
export function getTenantPrisma(): any {
  const context = tenantContext.getStore();
  if (!context?.prisma) {
    throw new Error('Contexte tenant non disponible. Middleware tenant requis.');
  }
  return context.prisma;
}

// Utilitaire pour vérifier si on est dans un contexte tenant
export function hasTenantContext(): boolean {
  return !!tenantContext.getStore();
}
