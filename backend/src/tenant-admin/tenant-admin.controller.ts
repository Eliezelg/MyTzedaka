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
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { TenantAdminService } from './tenant-admin.service';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantAdminController {
  constructor(private readonly tenantAdminService: TenantAdminService) {}

  // ========== THEME ENDPOINTS ==========
  @Get(':tenantId/theme')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getTheme(@Param('tenantId') tenantId: string) {
    return this.tenantAdminService.getTheme(tenantId);
  }

  @Put(':tenantId/theme')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateTheme(
    @Param('tenantId') tenantId: string,
    @Body() updateThemeDto: UpdateThemeDto
  ) {
    return this.tenantAdminService.updateTheme(tenantId, updateThemeDto);
  }

  @Post(':tenantId/theme/reset')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async resetTheme(@Param('tenantId') tenantId: string) {
    return this.tenantAdminService.resetTheme(tenantId);
  }

  // ========== PAGES ENDPOINTS ==========
  @Get(':tenantId/pages')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async getPages(@Param('tenantId') tenantId: string) {
    return this.tenantAdminService.getPages(tenantId);
  }

  @Get(':tenantId/pages/:pageId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async getPage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ) {
    return this.tenantAdminService.getPage(tenantId, pageId);
  }

  @Post(':tenantId/pages')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async createPage(
    @Param('tenantId') tenantId: string,
    @Body() createPageDto: CreatePageDto,
    @Request() req: any
  ) {
    return this.tenantAdminService.createPage(tenantId, req.user.id, createPageDto);
  }

  @Put(':tenantId/pages/:pageId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async updatePage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto
  ) {
    return this.tenantAdminService.updatePage(tenantId, pageId, updatePageDto);
  }

  @Delete(':tenantId/pages/:pageId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string
  ) {
    return this.tenantAdminService.deletePage(tenantId, pageId);
  }

  @Post(':tenantId/pages/:pageId/publish')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async publishPage(
    @Param('tenantId') tenantId: string,
    @Param('pageId') pageId: string,
    @Body('publish') publish: boolean
  ) {
    return this.tenantAdminService.publishPage(tenantId, pageId, publish);
  }

  // ========== CAMPAIGNS ENDPOINTS ==========
  @Get(':tenantId/campaigns')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'TREASURER')
  async getCampaigns(@Param('tenantId') tenantId: string) {
    return this.tenantAdminService.getCampaigns(tenantId);
  }

  @Get(':tenantId/campaigns/:campaignId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'TREASURER')
  async getCampaign(
    @Param('tenantId') tenantId: string,
    @Param('campaignId') campaignId: string
  ) {
    return this.tenantAdminService.getCampaign(tenantId, campaignId);
  }

  @Post(':tenantId/campaigns')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async createCampaign(
    @Param('tenantId') tenantId: string,
    @Body() createCampaignDto: CreateCampaignDto,
    @Request() req: any
  ) {
    return this.tenantAdminService.createCampaign(tenantId, req.user.id, createCampaignDto);
  }

  @Put(':tenantId/campaigns/:campaignId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER')
  async updateCampaign(
    @Param('tenantId') tenantId: string,
    @Param('campaignId') campaignId: string,
    @Body() updateCampaignDto: UpdateCampaignDto
  ) {
    return this.tenantAdminService.updateCampaign(tenantId, campaignId, updateCampaignDto);
  }

  @Delete(':tenantId/campaigns/:campaignId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCampaign(
    @Param('tenantId') tenantId: string,
    @Param('campaignId') campaignId: string
  ) {
    return this.tenantAdminService.deleteCampaign(tenantId, campaignId);
  }

  // ========== DONATIONS ENDPOINTS ==========
  @Get(':tenantId/donations')
  @Roles('ADMIN', 'SUPER_ADMIN', 'TREASURER')
  async getDonations(
    @Param('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('campaignId') campaignId?: string
  ) {
    return this.tenantAdminService.getDonations(tenantId, {
      startDate,
      endDate,
      status,
      campaignId
    });
  }

  @Get(':tenantId/donations/stats')
  @Roles('ADMIN', 'SUPER_ADMIN', 'TREASURER', 'MANAGER')
  async getDonationStats(
    @Param('tenantId') tenantId: string,
    @Query('period') period?: string
  ) {
    return this.tenantAdminService.getDonationStats(tenantId, period);
  }

  @Get(':tenantId/donors/top')
  @Roles('ADMIN', 'SUPER_ADMIN', 'TREASURER')
  async getTopDonors(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit?: string
  ) {
    return this.tenantAdminService.getTopDonors(tenantId, limit ? parseInt(limit) : 5);
  }
}
