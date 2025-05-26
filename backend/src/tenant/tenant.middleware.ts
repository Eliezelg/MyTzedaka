import { Injectable, NestMiddleware, Logger, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';
import { tenantContext } from './tenant.context';

// Extension de l'interface Request pour inclure les infos tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        name: string;
        domain?: string;
        status: string;
      };
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    this.logger.debug(`Middleware tenant - Chemin: ${req.path}, URL: ${req.url}`);

    try {
      // 1. Identifier le tenant depuis l'URL
      const tenantIdentifier = this.extractTenantIdentifier(req);
      
      // Si aucun tenant n'est requis (routes publiques), continuer sans tenant
      if (!tenantIdentifier) {
        this.logger.debug(`Aucun tenant requis pour ${req.path} - continuer sans contexte tenant`);
        return next();
      }

      // 2. Récupérer les informations du tenant
      const tenant = await this.tenantService.findByIdentifier(tenantIdentifier);
      
      if (!tenant) {
        this.logger.warn(`Tenant non trouvé: ${tenantIdentifier}`);
        throw new BadRequestException(`Tenant non trouvé: ${tenantIdentifier}`);
      }

      if (tenant.status !== 'ACTIVE') {
        this.logger.warn(`Tenant inactif: ${tenantIdentifier} (${tenant.status})`);
        throw new BadRequestException(`Tenant ${tenantIdentifier} est ${tenant.status.toLowerCase()}`);
      }

      // 3. Créer le contexte tenant avec Prisma isolé
      const tenantPrisma = this.prisma.forTenant(tenant.id);

      // 4. Stocker les informations dans la requête
      req.tenant = {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        domain: tenant.domain || undefined,
        status: tenant.status,
      };

      // 5. Établir le contexte AsyncLocalStorage
      const context = {
        tenant: req.tenant,
        prisma: tenantPrisma,
        startTime,
      };

      // 6. Exécuter la suite dans le contexte tenant
      await tenantContext.run(context, async () => {
        this.logger.debug(`Contexte tenant établi: ${tenant.slug} (${tenant.id})`);
        next();
      });

    } catch (error) {
      this.logger.error('Erreur dans le middleware tenant:', error);
      
      if (error instanceof BadRequestException) {
        return res.status(400).json({
          error: 'Tenant Error',
          message: error.message,
          statusCode: 400,
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erreur lors de la résolution du tenant',
        statusCode: 500,
      });
    }
  }

  private extractTenantIdentifier(req: Request): string | null {
    // Ignorer certaines routes qui ne nécessitent pas de tenant
    if (req.path.startsWith('/api/hub/') || 
        req.path.startsWith('/api/auth/') || 
        req.path.startsWith('/api/health') ||
        req.path === '/health') {
      this.logger.debug(`Route publique détectée: ${req.path} - pas de tenant requis`);
      return null;
    }

    // Méthode 1: Depuis l'en-tête X-Tenant-ID
    const headerTenant = req.headers['x-tenant-id'] as string;
    if (headerTenant) {
      this.logger.debug(`Tenant depuis header: ${headerTenant}`);
      return headerTenant;
    }

    // Méthode 2: Depuis le sous-domaine
    const host = req.headers.host;
    if (host) {
      // En développement, ignorer localhost complètement
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        this.logger.debug(`Environnement de développement détecté: ${host} - pas de tenant depuis sous-domaine`);
      } else {
        // Exemple: community1.mytzedaka.com -> community1
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          this.logger.debug(`Tenant depuis sous-domaine: ${subdomain}`);
          return subdomain;
        }
      }
    }

    // Méthode 3: Depuis le paramètre de requête
    const queryTenant = req.query.tenant as string;
    if (queryTenant) {
      this.logger.debug(`Tenant depuis query param: ${queryTenant}`);
      return queryTenant;
    }

    // Méthode 4: Depuis le path (ex: /api/tenant/community1/...)
    const pathMatch = req.path.match(/^\/api\/tenant\/([^\/]+)/);
    if (pathMatch) {
      const pathTenant = pathMatch[1];
      this.logger.debug(`Tenant depuis path: ${pathTenant}`);
      return pathTenant;
    }

    return null;
  }
}
