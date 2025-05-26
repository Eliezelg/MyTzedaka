import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Service Prisma tenant-aware (version basique)
  forTenant(tenantId: string) {
    // Retourne le client Prisma avec le tenantId attaché
    const client = this as any;
    client._tenantId = tenantId;
    return client;
  }

  // Helper pour récupérer le tenantId actuel
  getCurrentTenantId(): string | null {
    return (this as any)._tenantId || null;
  }
}
