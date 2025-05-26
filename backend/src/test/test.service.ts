import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersByTenant(tenantId: string) {
    const [users, tenant] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          tenantId,
          isActive: true,
        },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
      }),
    ]);

    // Ajouter manuellement les informations du tenant à chaque utilisateur
    const usersWithTenant = users.map(user => ({
      ...user,
      tenant,
    }));

    return {
      users: usersWithTenant,
      tenant,
    };
  }

  async getTenantById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getTenantBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
