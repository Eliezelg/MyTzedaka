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
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PageManagementService } from '../admin/page-management.service';
import { 
  CreatePageDto, 
  UpdatePageDto, 
  PageListQueryDto,
  UpdateNavigationDto 
} from '../admin/dto/page-management.dto';

@ApiTags('pages')
@Controller('')
export class PagesController {
  constructor(
    private readonly pageManagementService: PageManagementService,
  ) {}

  // Routes publiques pour les sites custom
  @Get('tenants/:tenantId/pages/:slug')
  @ApiOperation({ summary: 'Get a published page by slug for a tenant site' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'slug', description: 'Page slug' })
  @ApiResponse({ status: 200, description: 'Page found' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async getPageBySlug(
    @Param('tenantId') tenantId: string,
    @Param('slug') slug: string
  ) {
    // Handle home page (empty slug)
    const pageSlug = slug || 'home';
    return await this.pageManagementService.getPageBySlug(tenantId, pageSlug);
  }

  @Get('tenant/:tenantId/pages')
  @ApiOperation({ summary: 'Get all published pages for a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by page type' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Pages retrieved' })
  async getPages(
    @Param('tenantId') tenantId: string,
    @Query() query: PageListQueryDto
  ) {
    // Only return active and published pages for public access
    const publicQuery: PageListQueryDto = {
      ...query,
      isActive: true,
      status: 'PUBLISHED' as any // Force type for enum
    };
    return await this.pageManagementService.getPages(tenantId, publicQuery);
  }

  @Get('tenant/:tenantId/navigation')
  @ApiOperation({ summary: 'Get navigation configuration for a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Navigation configuration' })
  async getNavigation(@Param('tenantId') tenantId: string) {
    return await this.pageManagementService.getActiveNavigation(tenantId);
  }

  // Routes admin protégées
  @Post('tenant/:tenantId/pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new page' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 201, description: 'Page created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 409, description: 'Page slug already exists' })
  async createPage(
    @Param('tenantId') tenantId: string,
    @Body() createPageDto: CreatePageDto
  ) {
    return await this.pageManagementService.createPage(tenantId, createPageDto);
  }

  @Put('tenant/:tenantId/pages/:pageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a page' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async updatePage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto
  ) {
    return await this.pageManagementService.updatePage(tenantId, pageId, updatePageDto);
  }

  @Delete('tenant/:tenantId/pages/:pageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({ status: 204, description: 'Page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async deletePage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ) {
    await this.pageManagementService.deletePage(tenantId, pageId);
  }

  @Put('tenant/:tenantId/pages/:pageId/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle page active status' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page status toggled' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async togglePageStatus(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ) {
    return await this.pageManagementService.togglePageStatus(tenantId, pageId);
  }

  @Put('tenant/:tenantId/navigation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update navigation configuration' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Navigation updated' })
  async updateNavigation(
    @Param('tenantId') tenantId: string,
    @Body() updateNavigationDto: UpdateNavigationDto
  ) {
    await this.pageManagementService.updateNavigation(tenantId, updateNavigationDto);
    return { message: 'Navigation updated successfully' };
  }

  @Get('tenant/:tenantId/pages/admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pages for admin (including drafts)' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Pages retrieved' })
  async getAdminPages(
    @Param('tenantId') tenantId: string,
    @Query() query: PageListQueryDto
  ) {
    // Admin can see all pages regardless of status
    return await this.pageManagementService.getPages(tenantId, query);
  }

  @Get('page-templates/:type')
  @ApiOperation({ summary: 'Get available page templates' })
  @ApiParam({ name: 'type', description: 'Page type' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getPageTemplates(@Param('type') type: any) {
    return await this.pageManagementService.getPageTemplates(type);
  }
}