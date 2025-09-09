import { validateTenantSlug, validateUUID } from './sanitizer';

/**
 * Service de validation et sécurisation des tenant IDs
 * Empêche l'accès non autorisé aux données d'autres tenants
 */

interface TenantValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

class TenantValidator {
  private static instance: TenantValidator;
  private validatedTenants: Map<string, boolean> = new Map();
  private currentTenant: string | null = null;

  private constructor() {}

  public static getInstance(): TenantValidator {
    if (!TenantValidator.instance) {
      TenantValidator.instance = new TenantValidator();
    }
    return TenantValidator.instance;
  }

  /**
   * Valide un tenant ID (UUID ou slug)
   */
  public validateTenantId(tenantId: string | null | undefined): TenantValidationResult {
    if (!tenantId || typeof tenantId !== 'string') {
      return {
        isValid: false,
        error: 'Tenant ID is required and must be a string'
      };
    }

    // Nettoyer l'input
    const trimmed = tenantId.trim().toLowerCase();

    // Vérifier si c'est un UUID
    if (trimmed.includes('-') && trimmed.length === 36) {
      if (validateUUID(trimmed)) {
        return {
          isValid: true,
          sanitizedValue: trimmed
        };
      }
      return {
        isValid: false,
        error: 'Invalid UUID format for tenant ID'
      };
    }

    // Sinon, vérifier si c'est un slug valide
    if (validateTenantSlug(trimmed)) {
      return {
        isValid: true,
        sanitizedValue: trimmed
      };
    }

    return {
      isValid: false,
      error: 'Invalid tenant ID format. Must be a valid UUID or slug (3-50 chars, lowercase, alphanumeric with hyphens)'
    };
  }

  /**
   * Valide un domaine de tenant
   */
  public validateTenantDomain(domain: string | null | undefined): TenantValidationResult {
    if (!domain || typeof domain !== 'string') {
      return {
        isValid: false,
        error: 'Domain is required and must be a string'
      };
    }

    const trimmed = domain.trim().toLowerCase();

    // Validation basique du domaine
    const domainRegex = /^([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}$/;
    
    // Permettre aussi les slugs simples pour dev/test
    const slugRegex = /^[a-z0-9-]+$/;

    if (domainRegex.test(trimmed) || slugRegex.test(trimmed)) {
      // Vérifier les domaines interdits
      const blacklistedDomains = [
        'admin',
        'api',
        'www',
        'mail',
        'ftp',
        'localhost',
        'example',
        'test'
      ];

      const firstPart = trimmed.split('.')[0];
      if (blacklistedDomains.includes(firstPart)) {
        return {
          isValid: false,
          error: `Domain '${firstPart}' is reserved`
        };
      }

      return {
        isValid: true,
        sanitizedValue: trimmed
      };
    }

    return {
      isValid: false,
      error: 'Invalid domain format'
    };
  }

  /**
   * Valide les headers de tenant dans une requête
   */
  public validateTenantHeaders(headers: Record<string, string | string[] | undefined>): TenantValidationResult {
    const tenantHeader = headers['x-tenant-id'] || headers['X-Tenant-ID'];
    
    if (!tenantHeader) {
      // Pas de header tenant, peut être valide pour les routes publiques
      return {
        isValid: true,
        sanitizedValue: undefined
      };
    }

    const tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    return this.validateTenantId(tenantId);
  }

  /**
   * Valide et extrait le tenant depuis une URL
   */
  public extractTenantFromUrl(url: string): TenantValidationResult {
    try {
      const urlObj = new URL(url);
      
      // Vérifier le sous-domaine
      const hostname = urlObj.hostname;
      const parts = hostname.split('.');
      
      if (parts.length >= 3) {
        // Format: tenant.mytzedaka.com
        const subdomain = parts[0];
        return this.validateTenantDomain(subdomain);
      }

      // Vérifier le path
      const pathMatch = urlObj.pathname.match(/^\/sites\/([^\/]+)/);
      if (pathMatch) {
        return this.validateTenantId(pathMatch[1]);
      }

      // Vérifier les query params
      const tenantParam = urlObj.searchParams.get('tenant');
      if (tenantParam) {
        return this.validateTenantId(tenantParam);
      }

      return {
        isValid: true,
        sanitizedValue: undefined
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Définit le tenant actuel pour validation croisée
   */
  public setCurrentTenant(tenantId: string): boolean {
    const validation = this.validateTenantId(tenantId);
    if (validation.isValid && validation.sanitizedValue) {
      this.currentTenant = validation.sanitizedValue;
      return true;
    }
    return false;
  }

  /**
   * Vérifie si un tenant ID correspond au tenant actuel
   */
  public isCurrentTenant(tenantId: string): boolean {
    if (!this.currentTenant) return false;
    
    const validation = this.validateTenantId(tenantId);
    return validation.isValid && validation.sanitizedValue === this.currentTenant;
  }

  /**
   * Cache la validation d'un tenant pour performance
   */
  public cacheValidation(tenantId: string, isValid: boolean): void {
    if (this.validatedTenants.size > 1000) {
      // Nettoyer le cache s'il devient trop grand
      this.validatedTenants.clear();
    }
    this.validatedTenants.set(tenantId, isValid);
  }

  /**
   * Vérifie si un tenant a déjà été validé
   */
  public isCachedValid(tenantId: string): boolean | undefined {
    return this.validatedTenants.get(tenantId);
  }

  /**
   * Middleware pour Express/Next.js API routes
   */
  public createMiddleware() {
    return (req: any, res: any, next: any) => {
      // Valider le header tenant
      const headerValidation = this.validateTenantHeaders(req.headers);
      
      if (!headerValidation.isValid) {
        return res.status(400).json({
          error: 'Invalid tenant header',
          details: headerValidation.error
        });
      }

      // Valider le tenant dans l'URL
      const urlValidation = this.extractTenantFromUrl(req.url);
      
      if (!urlValidation.isValid) {
        return res.status(400).json({
          error: 'Invalid tenant in URL',
          details: urlValidation.error
        });
      }

      // Vérifier la cohérence entre header et URL
      if (headerValidation.sanitizedValue && urlValidation.sanitizedValue) {
        if (headerValidation.sanitizedValue !== urlValidation.sanitizedValue) {
          return res.status(403).json({
            error: 'Tenant mismatch',
            details: 'Tenant ID in header does not match URL'
          });
        }
      }

      // Ajouter le tenant validé à la requête
      req.validatedTenant = headerValidation.sanitizedValue || urlValidation.sanitizedValue;
      
      next();
    };
  }

  /**
   * Hook React pour utiliser le validateur
   */
  public static useTenantValidator() {
    return TenantValidator.getInstance();
  }
}

// Export du singleton
export const tenantValidator = TenantValidator.getInstance();

// Export des méthodes utilitaires
export const {
  validateTenantId,
  validateTenantDomain,
  validateTenantHeaders,
  extractTenantFromUrl,
  setCurrentTenant,
  isCurrentTenant
} = {
  validateTenantId: (id: string) => tenantValidator.validateTenantId(id),
  validateTenantDomain: (domain: string) => tenantValidator.validateTenantDomain(domain),
  validateTenantHeaders: (headers: Record<string, string | string[] | undefined>) => 
    tenantValidator.validateTenantHeaders(headers),
  extractTenantFromUrl: (url: string) => tenantValidator.extractTenantFromUrl(url),
  setCurrentTenant: (id: string) => tenantValidator.setCurrentTenant(id),
  isCurrentTenant: (id: string) => tenantValidator.isCurrentTenant(id)
};

// Hook React personnalisé
export function useTenantValidator() {
  return tenantValidator;
}