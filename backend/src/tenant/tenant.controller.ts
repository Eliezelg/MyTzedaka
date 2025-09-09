import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Req, 
  UseInterceptors, 
  UploadedFile, 
  Res,
  StreamableFile,
  UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { TenantService } from './tenant.service';
import { TenantModulesService, UpdateModulesDto } from './tenant-modules.service';
import { FileUploadService } from './file-upload.service';
import { getCurrentTenant } from './tenant.context';
import { GetTenant } from './get-tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { createReadStream } from 'fs';

@ApiTags('tenant')
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantModulesService: TenantModulesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('current')
  @ApiOperation({ summary: 'Récupère les informations du tenant courant' })
  @ApiResponse({ status: 200, description: 'Informations du tenant courant' })
  getCurrentTenantInfo(@Req() req: Request) {
    const tenant = getCurrentTenant();
    
    return {
      tenant,
      headers: {
        host: req.headers.host,
        'x-tenant-id': req.headers['x-tenant-id'],
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('check-availability/:identifier')
  @ApiOperation({ summary: 'Vérifie la disponibilité d\'un slug ou sous-domaine' })
  @ApiParam({ name: 'identifier', description: 'Slug ou sous-domaine à vérifier' })
  @ApiResponse({ status: 200, description: 'Disponibilité vérifiée' })
  async checkAvailability(@Param('identifier') identifier: string) {
    try {
      const tenant = await this.tenantService.findByIdentifier(identifier);
      return { available: false, identifier, reason: 'Déjà utilisé' };
    } catch (error) {
      // Si on ne trouve pas le tenant, l'identifiant est disponible
      return { available: true, identifier };
    }
  }

  @Get('resolve/:domain')
  @ApiOperation({ summary: 'Résout un tenant par son domaine ou slug' })
  @ApiParam({ name: 'domain', description: 'Domaine ou slug du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant trouvé' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async resolveTenant(@Param('domain') domain: string) {
    return await this.tenantService.findByIdentifier(domain);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Récupère un tenant par son slug' })
  @ApiParam({ name: 'slug', description: 'Slug du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant trouvé' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async getTenant(@Param('slug') slug: string) {
    return await this.tenantService.findByIdentifier(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un nouveau tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Identifiant unique du tenant' },
        name: { type: 'string', description: 'Nom du tenant' },
        domain: { type: 'string', description: 'Domaine personnalisé (optionnel)' },
        theme: { type: 'object', description: 'Configuration du thème' },
        settings: { type: 'object', description: 'Paramètres du tenant' }
      },
      required: ['slug', 'name']
    }
  })
  @ApiResponse({ status: 201, description: 'Tenant créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createTenant(@Body() data: {
    slug: string;
    name: string;
    domain?: string;
    theme?: any;
    settings?: any;
  }) {
    return await this.tenantService.createTenant(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Met à jour un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async updateTenant(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return await this.tenantService.updateTenant(id, data);
  }

  @Put(':id/theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Met à jour le thème d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Configuration du thème',
      properties: {
        colors: { type: 'object' },
        typography: { type: 'object' },
        layout: { type: 'object' },
        components: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Thème mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async updateTenantTheme(
    @Param('id') id: string,
    @Body() theme: any
  ) {
    return await this.tenantService.updateTenant(id, { theme });
  }

  @Get(':id/theme')
  @ApiOperation({ summary: 'Récupère le thème d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Thème du tenant' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async getTenantTheme(@Param('id') id: string) {
    const tenant = await this.tenantService.findById(id);
    return tenant.theme || {};
  }

  @Put(':id/template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Met à jour le template d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Configuration du template',
      properties: {
        templateId: { type: 'string', description: 'ID du template sélectionné' },
        templateData: { type: 'object', description: 'Données personnalisées du template' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Template mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async updateTenantTemplate(
    @Param('id') id: string,
    @Body() data: { templateId: string; templateData: any }
  ) {
    return await this.tenantService.updateTenant(id, { 
      templateId: data.templateId,
      templateData: data.templateData 
    });
  }

  @Get(':id/template')
  @ApiOperation({ summary: 'Récupère le template d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Template du tenant' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async getTenantTemplate(@Param('id') id: string) {
    const tenant = await this.tenantService.findById(id);
    return {
      templateId: tenant.templateId || null,
      templateData: tenant.templateData || {}
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async deleteTenant(@Param('id') id: string) {
    await this.tenantService.deleteTenant(id);
    return { message: 'Tenant supprimé avec succès' };
  }

  @Get()
  @ApiOperation({ summary: 'Vérification de santé du middleware tenant' })
  @ApiResponse({ status: 200, description: 'Status du middleware tenant' })
  healthCheck(@Req() req: Request) {
    const tenant = getCurrentTenant();
    
    return {
      status: 'OK',
      message: 'Tenant middleware actif',
      tenant: tenant ? {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      } : null,
      identificationMethods: {
        header: req.headers['x-tenant-id'],
        subdomain: req.headers.host?.split('.')[0],
        query: req.query.tenant,
        path: req.path.match(/^\/api\/tenant\/([^\/]+)/) ? req.path.match(/^\/api\/tenant\/([^\/]+)/)![1] : null,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logo/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Upload logo for tenant' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  async uploadLogo(
    @GetTenant() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileUploadService.uploadTenantLogo(tenantId, file);
  }

  @Get(':tenantId/modules')
  @ApiOperation({ summary: 'Get tenant modules configuration' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Modules configuration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantModules(@Param('tenantId') tenantId: string) {
    return await this.tenantModulesService.getModules(tenantId);
  }

  @Put(':tenantId/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant modules configuration' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        donations: { type: 'boolean' },
        campaigns: { type: 'boolean' },
        events: { type: 'boolean' },
        blog: { type: 'boolean' },
        gallery: { type: 'boolean' },
        zmanim: { type: 'boolean' },
        prayers: { type: 'boolean' },
        courses: { type: 'boolean' },
        hebrewCalendar: { type: 'boolean' },
        members: { type: 'boolean' },
        library: { type: 'boolean' },
        yahrzeits: { type: 'boolean' },
        seatingChart: { type: 'boolean' },
        mikvah: { type: 'boolean' },
        kashrut: { type: 'boolean' },
        eruv: { type: 'boolean' },
        marketplace: { type: 'boolean' },
        directory: { type: 'boolean' },
        chesed: { type: 'boolean' },
        newsletter: { type: 'boolean' },
        modulesConfig: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Modules updated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateTenantModules(
    @Param('tenantId') tenantId: string,
    @Body() modules: UpdateModulesDto
  ) {
    return await this.tenantModulesService.updateModules(tenantId, modules);
  }

  @Get(':tenantId/modules/:moduleName/config')
  @ApiOperation({ summary: 'Get specific module configuration' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  @ApiParam({ name: 'moduleName', description: 'Module name' })
  @ApiResponse({ status: 200, description: 'Module configuration retrieved' })
  async getModuleConfig(
    @Param('tenantId') tenantId: string,
    @Param('moduleName') moduleName: string
  ) {
    return await this.tenantModulesService.getModuleConfig(tenantId, moduleName);
  }

  @Put(':tenantId/modules/:moduleName/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update specific module configuration' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  @ApiParam({ name: 'moduleName', description: 'Module name' })
  @ApiResponse({ status: 200, description: 'Module configuration updated' })
  async updateModuleConfig(
    @Param('tenantId') tenantId: string,
    @Param('moduleName') moduleName: string,
    @Body() config: any
  ) {
    return await this.tenantModulesService.updateModuleConfig(tenantId, moduleName, config);
  }

  @Post(':tenantId/modules/preset/:preset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply a preset configuration for modules' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  @ApiParam({ name: 'preset', description: 'Preset type', enum: ['association', 'synagogue', 'community'] })
  @ApiResponse({ status: 200, description: 'Preset applied successfully' })
  async applyModulesPreset(
    @Param('tenantId') tenantId: string,
    @Param('preset') preset: 'association' | 'synagogue' | 'community'
  ) {
    return await this.tenantModulesService.applyPreset(tenantId, preset);
  }

  @Get(':tenantId/navigation')
  @ApiOperation({ summary: 'Get tenant navigation configuration' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  async getTenantNavigation(@Param('tenantId') tenantId: string) {
    // Retourner une navigation par défaut pour l'instant
    return {
      mainMenu: [
        { label: 'Accueil', path: '/', icon: 'home' },
        { label: 'Faire un don', path: '/donate', icon: 'heart' },
        { label: 'Campagnes', path: '/campaigns', icon: 'flag' },
        { label: 'Événements', path: '/events', icon: 'calendar' },
        { label: 'À propos', path: '/about', icon: 'info' },
        { label: 'Contact', path: '/contact', icon: 'mail' }
      ],
      footerMenu: [
        { label: 'Mentions légales', path: '/legal' },
        { label: 'Politique de confidentialité', path: '/privacy' },
        { label: 'Contact', path: '/contact' }
      ],
      socialLinks: []
    };
  }

  @Get(':tenantId/logo')
  @ApiOperation({ summary: 'Get tenant logo' })
  async getTenantLogo(
    @Param('tenantId') tenantId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, mimeType } = await this.fileUploadService.getTenantLogo(tenantId);
    
    const file = createReadStream(filePath);
    
    res.set({
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });

    return new StreamableFile(file);
  }

  @Delete('logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete tenant logo' })
  @ApiBearerAuth()
  async deleteLogo(@GetTenant() tenantId: string) {
    await this.fileUploadService.deleteTenantLogo(tenantId);
    return { message: 'Logo deleted successfully' };
  }
}
