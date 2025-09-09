import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantListQueryDto,
  TenantResponseDto,
  AdminStatsDto,
  DeploymentDto,
} from './dto/admin.dto';
import { PageManagementService } from './page-management.service';
import {
  CreatePageDto,
  UpdatePageDto,
  PageListQueryDto,
  PageResponseDto,
  UpdateNavigationDto
} from './dto/page-management.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly pageManagementService: PageManagementService
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques admin globales' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées', type: AdminStatsDto })
  async getAdminStats(): Promise<AdminStatsDto> {
    return this.adminService.getAdminStats();
  }

  @Get('tenants')
  @ApiOperation({ summary: 'Lister tous les tenants avec pagination' })
  @ApiResponse({ status: 200, description: 'Liste des tenants', type: [TenantResponseDto] })
  async getTenants(@Query() query: TenantListQueryDto) {
    return this.adminService.getTenants(query);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Obtenir un tenant par ID' })
  @ApiResponse({ status: 200, description: 'Tenant trouvé', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async getTenantById(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.adminService.getTenantById(id);
  }

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouveau tenant' })
  @ApiResponse({ status: 201, description: 'Tenant créé', type: TenantResponseDto })
  @ApiResponse({ status: 409, description: 'Conflit - slug ou domaine déjà existant' })
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.adminService.createTenant(createTenantDto);
  }

  @Put('tenants/:id')
  @ApiOperation({ summary: 'Mettre à jour un tenant' })
  @ApiResponse({ status: 200, description: 'Tenant mis à jour', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.adminService.updateTenant(id, updateTenantDto);
  }

  @Delete('tenants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un tenant' })
  @ApiResponse({ status: 204, description: 'Tenant supprimé' })
  @ApiResponse({ status: 400, description: 'Impossible de supprimer - données actives' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async deleteTenant(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteTenant(id);
  }

  @Post('tenants/:id/deploy')
  @ApiOperation({ summary: 'Déployer le frontend d\'un tenant' })
  @ApiResponse({ status: 200, description: 'Déploiement initié' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async deployTenant(@Param('id') id: string, @Body() deploymentDto: DeploymentDto) {
    // À implémenter avec le service de déploiement
    return { 
      message: 'Déploiement initié',
      tenantId: id,
      deploymentId: 'deploy-' + Date.now(),
      status: 'IN_PROGRESS'
    };
  }

  @Get('tenants/:id/users')
  @ApiOperation({ summary: 'Lister les utilisateurs d\'un tenant' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  async getTenantUsers(@Param('id') id: string) {
    // À implémenter - récupérer les utilisateurs d'un tenant spécifique
    return {
      users: [],
      total: 0
    };
  }

  @Get('tenants/:id/analytics')
  @ApiOperation({ summary: 'Obtenir les analytics d\'un tenant' })
  @ApiResponse({ status: 200, description: 'Analytics du tenant' })
  async getTenantAnalytics(@Param('id') id: string) {
    // À implémenter - analytics détaillées par tenant
    return {
      tenantId: id,
      metrics: {
        donations: { total: 0, thisMonth: 0 },
        users: { total: 0, active: 0 },
        campaigns: { total: 0, active: 0 }
      }
    };
  }

  // ============== PAGES MANAGEMENT ==============

  @Get('tenants/:tenantId/pages')
  @ApiOperation({ summary: 'Lister les pages d\'un tenant' })
  @ApiResponse({ status: 200, description: 'Liste des pages', type: [PageResponseDto] })
  async getTenantPages(
    @Param('tenantId') tenantId: string,
    @Query() query: PageListQueryDto
  ) {
    return this.pageManagementService.getPages(tenantId, query);
  }

  @Get('tenants/:tenantId/pages/:pageId')
  @ApiOperation({ summary: 'Obtenir une page par ID' })
  @ApiResponse({ status: 200, description: 'Page trouvée', type: PageResponseDto })
  @ApiResponse({ status: 404, description: 'Page non trouvée' })
  async getPageById(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ): Promise<PageResponseDto> {
    const pages = await this.pageManagementService.getPages(tenantId, {
      limit: 1,
      offset: 0
    });
    const page = pages.pages.find(p => p.id === pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  @Post('tenants/:tenantId/pages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle page' })
  @ApiResponse({ status: 201, description: 'Page créée', type: PageResponseDto })
  @ApiResponse({ status: 409, description: 'Conflit - slug déjà existant' })
  async createPage(
    @Param('tenantId') tenantId: string,
    @Body() createPageDto: CreatePageDto
  ): Promise<PageResponseDto> {
    return this.pageManagementService.createPage(tenantId, createPageDto);
  }

  @Put('tenants/:tenantId/pages/:pageId')
  @ApiOperation({ summary: 'Mettre à jour une page' })
  @ApiResponse({ status: 200, description: 'Page mise à jour', type: PageResponseDto })
  @ApiResponse({ status: 404, description: 'Page non trouvée' })
  async updatePage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto
  ): Promise<PageResponseDto> {
    return this.pageManagementService.updatePage(tenantId, pageId, updatePageDto);
  }

  @Delete('tenants/:tenantId/pages/:pageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une page' })
  @ApiResponse({ status: 204, description: 'Page supprimée' })
  @ApiResponse({ status: 404, description: 'Page non trouvée' })
  async deletePage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ): Promise<void> {
    return this.pageManagementService.deletePage(tenantId, pageId);
  }

  @Post('tenants/:tenantId/pages/:pageId/toggle')
  @ApiOperation({ summary: 'Activer/Désactiver une page' })
  @ApiResponse({ status: 200, description: 'Statut de la page modifié', type: PageResponseDto })
  @ApiResponse({ status: 404, description: 'Page non trouvée' })
  async togglePageStatus(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ): Promise<PageResponseDto> {
    return this.pageManagementService.togglePageStatus(tenantId, pageId);
  }

  @Get('tenants/:tenantId/navigation')
  @ApiOperation({ summary: 'Obtenir la navigation d\'un tenant' })
  @ApiResponse({ status: 200, description: 'Navigation du tenant' })
  async getTenantNavigation(@Param('tenantId') tenantId: string) {
    return this.pageManagementService.getActiveNavigation(tenantId);
  }

  @Put('tenants/:tenantId/navigation')
  @ApiOperation({ summary: 'Mettre à jour la navigation d\'un tenant' })
  @ApiResponse({ status: 200, description: 'Navigation mise à jour' })
  async updateTenantNavigation(
    @Param('tenantId') tenantId: string,
    @Body() updateNavigationDto: UpdateNavigationDto
  ): Promise<void> {
    return this.pageManagementService.updateNavigation(tenantId, updateNavigationDto);
  }
}
