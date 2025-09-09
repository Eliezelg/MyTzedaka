import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantModules, Prisma } from '@prisma/client';

export interface UpdateModulesDto {
  donations?: boolean;
  campaigns?: boolean;
  events?: boolean;
  blog?: boolean;
  gallery?: boolean;
  zmanim?: boolean;
  prayers?: boolean;
  courses?: boolean;
  hebrewCalendar?: boolean;
  members?: boolean;
  library?: boolean;
  yahrzeits?: boolean;
  seatingChart?: boolean;
  mikvah?: boolean;
  kashrut?: boolean;
  eruv?: boolean;
  marketplace?: boolean;
  directory?: boolean;
  chesed?: boolean;
  newsletter?: boolean;
  modulesConfig?: Record<string, any>;
}

@Injectable()
export class TenantModulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupérer les modules d'un tenant (ou créer les defaults)
   */
  async getModules(tenantId: string): Promise<TenantModules> {
    // Vérifier que le tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Récupérer les modules existants
    let modules = await this.prisma.tenantModules.findUnique({
      where: { tenantId },
    });

    // Si pas de modules, créer les defaults
    if (!modules) {
      modules = await this.createDefaultModules(tenantId);
    }

    return modules;
  }

  /**
   * Créer les modules par défaut pour un tenant
   */
  async createDefaultModules(tenantId: string): Promise<TenantModules> {
    return await this.prisma.tenantModules.create({
      data: {
        tenantId,
        // Modules de base activés par défaut
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: false,
        // Modules synagogue désactivés par défaut
        zmanim: false,
        prayers: false,
        courses: false,
        hebrewCalendar: false,
        members: false,
        // Modules avancés désactivés par défaut
        library: false,
        yahrzeits: false,
        seatingChart: false,
        mikvah: false,
        kashrut: false,
        eruv: false,
        // Modules communautaires désactivés par défaut
        marketplace: false,
        directory: false,
        chesed: false,
        newsletter: false,
        // Configuration vide par défaut
        modulesConfig: {},
      },
    });
  }

  /**
   * Mettre à jour les modules d'un tenant
   */
  async updateModules(
    tenantId: string,
    updateModulesDto: UpdateModulesDto,
  ): Promise<TenantModules> {
    // Vérifier que le tenant existe
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // S'assurer que les modules existent (créer si nécessaire)
    let modules = await this.prisma.tenantModules.findUnique({
      where: { tenantId },
    });

    if (!modules) {
      modules = await this.createDefaultModules(tenantId);
    }

    // Mettre à jour les modules
    return await this.prisma.tenantModules.update({
      where: { tenantId },
      data: updateModulesDto,
    });
  }

  /**
   * Vérifier si un module est activé
   */
  async isModuleEnabled(
    tenantId: string,
    moduleName: keyof Omit<TenantModules, 'id' | 'tenantId' | 'modulesConfig' | 'createdAt' | 'updatedAt'>,
  ): Promise<boolean> {
    const modules = await this.getModules(tenantId);
    return modules[moduleName] as boolean;
  }

  /**
   * Récupérer la configuration d'un module spécifique
   */
  async getModuleConfig(
    tenantId: string,
    moduleName: string,
  ): Promise<any> {
    const modules = await this.getModules(tenantId);
    const config = modules.modulesConfig as Record<string, any>;
    return config[moduleName] || {};
  }

  /**
   * Mettre à jour la configuration d'un module spécifique
   */
  async updateModuleConfig(
    tenantId: string,
    moduleName: string,
    config: any,
  ): Promise<TenantModules> {
    const modules = await this.getModules(tenantId);
    const currentConfig = modules.modulesConfig as Record<string, any>;
    
    const updatedConfig = {
      ...currentConfig,
      [moduleName]: config,
    };

    return await this.prisma.tenantModules.update({
      where: { tenantId },
      data: {
        modulesConfig: updatedConfig,
      },
    });
  }

  /**
   * Activer un ensemble de modules pour un type d'organisation
   */
  async applyPreset(
    tenantId: string,
    preset: 'association' | 'synagogue' | 'community',
  ): Promise<TenantModules> {
    const presets = {
      association: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        newsletter: true,
      },
      synagogue: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        zmanim: true,
        prayers: true,
        courses: true,
        hebrewCalendar: true,
        members: true,
        yahrzeits: true,
      },
      community: {
        donations: true,
        campaigns: true,
        events: true,
        blog: true,
        gallery: true,
        members: true,
        marketplace: true,
        directory: true,
        chesed: true,
        newsletter: true,
      },
    };

    return await this.updateModules(tenantId, presets[preset]);
  }

  /**
   * Obtenir les statistiques d'utilisation des modules
   */
  async getModulesStats(): Promise<any> {
    const allModules = await this.prisma.tenantModules.findMany();
    
    const stats = {
      totalTenants: allModules.length,
      moduleUsage: {} as Record<string, number>,
    };

    // Liste des modules à analyser
    const moduleNames = [
      'donations', 'campaigns', 'events', 'blog', 'gallery',
      'zmanim', 'prayers', 'courses', 'hebrewCalendar', 'members',
      'library', 'yahrzeits', 'seatingChart', 'mikvah', 'kashrut', 'eruv',
      'marketplace', 'directory', 'chesed', 'newsletter',
    ];

    // Calculer l'utilisation de chaque module
    moduleNames.forEach((moduleName) => {
      stats.moduleUsage[moduleName] = allModules.filter(
        (m) => m[moduleName] === true,
      ).length;
    });

    return stats;
  }
}