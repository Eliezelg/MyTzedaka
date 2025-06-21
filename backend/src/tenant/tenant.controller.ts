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
