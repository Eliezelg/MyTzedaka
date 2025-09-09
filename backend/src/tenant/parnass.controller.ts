import { Controller, Get, Param, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParnassService } from '../parnass/parnass.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tenant-parnass')
@Controller('tenant/:tenantId/parnass')
export class TenantParnassController {
  constructor(private readonly parnassService: ParnassService) {}

  @Get('current')
  @Public()
  @ApiOperation({ summary: 'Get current sponsors for display' })
  async getCurrentSponsors(@Param('tenantId') tenantId: string) {
    return this.parnassService.getCurrentSponsors(tenantId);
  }

  @Get('available-dates')
  @Public()
  @ApiOperation({ summary: 'Get available dates for sponsorship booking' })
  async getAvailableDates(
    @Param('tenantId') tenantId: string,
    @Query('type') type: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month !== undefined ? month : currentDate.getMonth();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    return this.parnassService.getAvailableDates(tenantId, type as any, startDate, endDate);
  }

  @Post('sponsor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a sponsorship request' })
  async requestSponsorship(
    @Param('tenantId') tenantId: string,
    @Body() sponsorData: any,
    @Req() req: any,
  ) {
    // Ajouter l'ID de l'utilisateur connecté
    const dataWithUser = {
      ...sponsorData,
      userId: req.user?.id,
    };
    
    return this.parnassService.createSponsor(tenantId, dataWithUser);
  }

  @Get('settings')
  @Public()
  @ApiOperation({ summary: 'Get public Parnass settings' })
  async getPublicSettings(@Param('tenantId') tenantId: string) {
    const settings = await this.parnassService.getSettings(tenantId);
    
    // Retourner uniquement les informations publiques
    return {
      dailyEnabled: settings.dailyEnabled,
      monthlyEnabled: settings.monthlyEnabled,
      yearlyEnabled: settings.yearlyEnabled,
      dailyPrice: settings.dailyPrice,
      monthlyPrice: settings.monthlyPrice,
      yearlyPrice: settings.yearlyPrice,
      currency: settings.currency,
      dailyTitle: settings.dailyTitle,
      monthlyTitle: settings.monthlyTitle,
      yearlyTitle: settings.yearlyTitle,
      dailyTitleHebrew: settings.dailyTitleHebrew,
      monthlyTitleHebrew: settings.monthlyTitleHebrew,
      yearlyTitleHebrew: settings.yearlyTitleHebrew,
      allowMultipleSponsors: settings.allowMultipleSponsors,
    };
  }
}