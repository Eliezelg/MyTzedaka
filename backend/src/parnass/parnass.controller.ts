import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch,
  Body, 
  Param, 
  Query, 
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ParnassType, ParnassStatus } from '@prisma/client';
import { ParnassService, CreateParnassSponsorDto, UpdateParnassSponsorDto, ParnassSettingsDto } from './parnass.service';

@ApiTags('parnass')
@Controller('admin/tenants/:tenantId/parnass')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParnassController {
  constructor(private readonly parnassService: ParnassService) {}
  
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get parnass sponsors for a date range' })
  async getSponsors(
    @Param('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: ParnassType,
    @Query('status') status?: ParnassStatus,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.parnassService.getSponsors(tenantId, start, end, type, status);
  }

  @Get('settings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get parnass settings' })
  async getSettings(@Param('tenantId') tenantId: string) {
    return this.parnassService.getSettings(tenantId);
  }

  @Put('settings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update parnass settings' })
  async updateSettings(
    @Param('tenantId') tenantId: string,
    @Body() settings: ParnassSettingsDto
  ) {
    return this.parnassService.updateSettings(tenantId, settings);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new sponsor' })
  async createSponsor(
    @Param('tenantId') tenantId: string,
    @Body() sponsorData: CreateParnassSponsorDto
  ) {
    return this.parnassService.createSponsor(tenantId, sponsorData);
  }

  @Patch(':sponsorId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a sponsor' })
  async updateSponsor(
    @Param('tenantId') tenantId: string,
    @Param('sponsorId') sponsorId: string,
    @Body() updates: UpdateParnassSponsorDto
  ) {
    return this.parnassService.updateSponsor(tenantId, sponsorId, updates);
  }

  @Delete(':sponsorId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a sponsor' })
  async deleteSponsor(
    @Param('tenantId') tenantId: string,
    @Param('sponsorId') sponsorId: string
  ) {
    return this.parnassService.deleteSponsor(tenantId, sponsorId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current sponsors (daily, monthly, yearly)' })
  async getCurrentSponsors(@Param('tenantId') tenantId: string) {
    return this.parnassService.getCurrentSponsors(tenantId);
  }

  @Get('available-dates')
  @ApiOperation({ summary: 'Get available dates for sponsorship' })
  async getAvailableDates(
    @Param('tenantId') tenantId: string,
    @Query('type') type: ParnassType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.parnassService.getAvailableDates(tenantId, type, start, end);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get Parnass statistics' })
  async getStatistics(
    @Param('tenantId') tenantId: string,
    @Query('year') year?: number,
  ) {
    return this.parnassService.getStatistics(tenantId, year);
  }

  @Post(':sponsorId/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Approve a sponsor' })
  async approveSponsor(
    @Param('tenantId') tenantId: string,
    @Param('sponsorId') sponsorId: string,
    @Req() req: any,
  ) {
    const approvedBy = req.user?.id || 'admin';
    return this.parnassService.approveSponsor(tenantId, sponsorId, approvedBy);
  }

  @Post(':sponsorId/reject')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Reject a sponsor' })
  async rejectSponsor(
    @Param('tenantId') tenantId: string,
    @Param('sponsorId') sponsorId: string,
  ) {
    return this.parnassService.rejectSponsor(tenantId, sponsorId);
  }

  @Post('cleanup')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cleanup expired sponsors' })
  async cleanupExpired(@Param('tenantId') tenantId: string) {
    return this.parnassService.cleanupExpiredSponsors(tenantId);
  }
}