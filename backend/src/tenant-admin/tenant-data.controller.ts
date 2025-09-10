import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantDataService } from './tenant-data.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('tenants/:slug')
@UseGuards(JwtAuthGuard)
export class TenantDataController {
  constructor(
    private readonly tenantDataService: TenantDataService,
    private readonly prisma: PrismaService,
  ) {}

  // Get tenant stats
  @Get('stats')
  async getTenantStats(@Param('slug') slug: string, @Request() req: any) {
    return this.tenantDataService.getTenantStats(slug, req.user);
  }

  // Get tenant campaigns
  @Get('campaigns')
  async getTenantCampaigns(@Param('slug') slug: string, @Request() req: any) {
    return this.tenantDataService.getTenantCampaigns(slug, req.user);
  }

  // Create campaign
  @Post('campaigns')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async createCampaign(
    @Param('slug') slug: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    return this.tenantDataService.createCampaign(slug, data, req.user);
  }

  // Update campaign
  @Patch('campaigns/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async updateCampaign(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    return this.tenantDataService.updateCampaign(slug, id, data, req.user);
  }

  // Delete campaign
  @Delete('campaigns/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async deleteCampaign(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.tenantDataService.deleteCampaign(slug, id, req.user);
  }

  // Get donations
  @Get('donations')
  async getTenantDonations(
    @Param('slug') slug: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req: any,
  ) {
    return this.tenantDataService.getTenantDonations(
      slug,
      parseInt(page),
      parseInt(limit),
      req.user,
    );
  }

  // Get members
  @Get('members')
  async getTenantMembers(
    @Param('slug') slug: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req: any,
  ) {
    return this.tenantDataService.getTenantMembers(
      slug,
      parseInt(page),
      parseInt(limit),
      req.user,
    );
  }

  // Invite member
  @Post('members/invite')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async inviteMember(
    @Param('slug') slug: string,
    @Body() data: { email: string; role?: string },
    @Request() req: any,
  ) {
    return this.tenantDataService.inviteMember(slug, data, req.user);
  }

  // Get admins
  @Get('admins')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async getTenantAdmins(@Param('slug') slug: string, @Request() req: any) {
    return this.tenantDataService.getTenantAdmins(slug, req.user);
  }

  // Add admin
  @Post('admins')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async addAdmin(
    @Param('slug') slug: string,
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.tenantDataService.addAdmin(slug, email, req.user);
  }

  // Remove admin
  @Delete('admins/:userId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async removeAdmin(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    return this.tenantDataService.removeAdmin(slug, userId, req.user);
  }

  // Get settings
  @Get('settings')
  async getTenantSettings(@Param('slug') slug: string, @Request() req: any) {
    return this.tenantDataService.getTenantSettings(slug, req.user);
  }

  // Update settings
  @Patch('settings')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'ASSOCIATION_ADMIN')
  async updateTenantSettings(
    @Param('slug') slug: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    return this.tenantDataService.updateTenantSettings(slug, data, req.user);
  }

  // Get Stripe status
  @Get('stripe/status')
  async getStripeStatus(@Param('slug') slug: string, @Request() req: any) {
    return this.tenantDataService.getStripeStatus(slug, req.user);
  }

  // Get receipts
  @Get('receipts')
  async getTenantReceipts(
    @Param('slug') slug: string,
    @Request() req: any,
    @Query('year') year?: string,
  ) {
    return this.tenantDataService.getTenantReceipts(
      slug,
      year ? parseInt(year) : undefined,
      req.user,
    );
  }

  // Get events
  @Get('events')
  async getTenantEvents(@Param('slug') slug: string, @Request() req: any) {
    return this.tenantDataService.getTenantEvents(slug, req.user);
  }

  // Get activity
  @Get('activity')
  async getTenantActivity(
    @Param('slug') slug: string,
    @Query('limit') limit: string = '10',
    @Request() req: any,
  ) {
    return this.tenantDataService.getTenantActivity(
      slug,
      parseInt(limit),
      req.user,
    );
  }
}