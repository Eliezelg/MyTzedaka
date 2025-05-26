import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  private readonly cache = new Map<string, Tenant>();

  constructor(private readonly prisma: PrismaService) {}

  async findByIdentifier(identifier: string): Promise<Tenant | null> {
    try {
      // Vérifier le cache d'abord
      const cacheKey = `tenant:${identifier}`;
      if (this.cache.has(cacheKey)) {
        this.logger.debug(`Tenant trouvé en cache: ${identifier}`);
        return this.cache.get(cacheKey)!;
      }

      // Rechercher par slug ou domaine
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: identifier },
            { domain: identifier }
          ]
        }
      });

      if (tenant) {
        // Mettre en cache pour 5 minutes
        this.cache.set(cacheKey, tenant);
        setTimeout(() => {
          this.cache.delete(cacheKey);
        }, 5 * 60 * 1000);

        this.logger.debug(`Tenant trouvé: ${tenant.slug} (${tenant.id})`);
      } else {
        this.logger.warn(`Tenant non trouvé: ${identifier}`);
      }

      return tenant;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche du tenant ${identifier}:`, error);
      return null;
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      return await this.prisma.tenant.findUnique({
        where: { id }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche du tenant par ID ${id}:`, error);
      return null;
    }
  }

  async createTenant(data: {
    slug: string;
    name: string;
    domain?: string;
    theme?: any;
    settings?: any;
  }): Promise<Tenant> {
    try {
      const tenant = await this.prisma.tenant.create({
        data: {
          slug: data.slug,
          name: data.name,
          domain: data.domain,
          theme: data.theme || {},
          settings: data.settings || {},
          status: 'ACTIVE'
        }
      });

      this.logger.log(`Nouveau tenant créé: ${tenant.slug} (${tenant.id})`);
      return tenant;
    } catch (error) {
      this.logger.error('Erreur lors de la création du tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    try {
      const tenant = await this.prisma.tenant.update({
        where: { id },
        data
      });

      // Invalider le cache
      this.invalidateCache(tenant.slug);
      if (tenant.domain) {
        this.invalidateCache(tenant.domain);
      }

      this.logger.log(`Tenant mis à jour: ${tenant.slug} (${tenant.id})`);
      return tenant;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du tenant ${id}:`, error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      const tenant = await this.findById(id);
      if (!tenant) {
        throw new NotFoundException(`Tenant ${id} non trouvé`);
      }

      await this.prisma.tenant.update({
        where: { id },
        data: { status: 'DELETED' }
      });

      // Invalider le cache
      this.invalidateCache(tenant.slug);
      if (tenant.domain) {
        this.invalidateCache(tenant.domain);
      }

      this.logger.log(`Tenant supprimé: ${tenant.slug} (${tenant.id})`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du tenant ${id}:`, error);
      throw error;
    }
  }

  private invalidateCache(identifier: string): void {
    const cacheKey = `tenant:${identifier}`;
    this.cache.delete(cacheKey);
  }

  // Méthode pour nettoyer le cache périodiquement
  clearCache(): void {
    this.cache.clear();
    this.logger.log('Cache tenant nettoyé');
  }
}
