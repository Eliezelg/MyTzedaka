import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ZmanimService, ZmanimSettingsDto } from './zmanim.service';
import { TenantContextService } from './tenant-context.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tenant/:tenantId/zmanim')
export class ZmanimController {
  constructor(
    private readonly zmanimService: ZmanimService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Obtenir les paramètres Zmanim du tenant
   * GET /api/tenant/:tenantId/zmanim/settings
   */
  @Get('settings')
  @Public() // Les paramètres peuvent être publics pour afficher les zmanim
  async getSettings(@Param('tenantId') tenantId: string) {
    return await this.zmanimService.getSettings(tenantId);
  }

  /**
   * Mettre à jour les paramètres Zmanim
   * PUT /api/tenant/:tenantId/zmanim/settings
   */
  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Param('tenantId') tenantId: string,
    @Body() settings: ZmanimSettingsDto,
  ) {
    return await this.zmanimService.updateSettings(tenantId, settings);
  }

  /**
   * Obtenir les zmanim du jour
   * GET /api/tenant/:tenantId/zmanim/today
   */
  @Get('today')
  @Public()
  async getTodayZmanim(@Param('tenantId') tenantId: string) {
    const today = new Date();
    return await this.zmanimService.getZmanimForDate(tenantId, today);
  }

  /**
   * Obtenir les zmanim pour une date spécifique
   * GET /api/tenant/:tenantId/zmanim/date?date=2024-01-15
   */
  @Get('date')
  @Public()
  async getZmanimByDate(
    @Param('tenantId') tenantId: string,
    @Query('date') dateString: string,
  ) {
    const date = dateString ? new Date(dateString) : new Date();
    return await this.zmanimService.getZmanimForDate(tenantId, date);
  }

  /**
   * Obtenir les horaires de Shabbat
   * GET /api/tenant/:tenantId/zmanim/shabbat
   */
  @Get('shabbat')
  @Public()
  async getShabbatTimes(
    @Param('tenantId') tenantId: string,
    @Query('date') dateString?: string,
  ) {
    const date = dateString ? new Date(dateString) : undefined;
    return await this.zmanimService.getShabbatTimes(tenantId, date);
  }

  /**
   * Obtenir les zmanim de la semaine
   * GET /api/tenant/:tenantId/zmanim/week
   */
  @Get('week')
  @Public()
  async getWeeklyZmanim(
    @Param('tenantId') tenantId: string,
    @Query('startDate') startDateString?: string,
  ) {
    const startDate = startDateString ? new Date(startDateString) : new Date();
    return await this.zmanimService.getWeeklyZmanim(tenantId, startDate);
  }

  /**
   * Obtenir les zmanim pour affichage sur le site (version simplifiée)
   * GET /api/tenant/:tenantId/zmanim/display
   */
  @Get('display')
  @Public()
  async getDisplayZmanim(@Param('tenantId') tenantId: string) {
    const today = new Date();
    const zmanim = await this.zmanimService.getZmanimForDate(tenantId, today);
    const settings = await this.zmanimService.getSettings(tenantId);
    
    // Filtrer selon les zmanim sélectionnés dans les paramètres
    const displayZmanim: any = {};
    
    if (settings.selectedZmanim && Array.isArray(settings.selectedZmanim)) {
      settings.selectedZmanim.forEach(key => {
        if (zmanim[key as keyof typeof zmanim]) {
          displayZmanim[key] = zmanim[key as keyof typeof zmanim];
        }
      });
    }
    
    // Toujours inclure les informations importantes
    displayZmanim.hebrewDate = zmanim.hebrewDate;
    displayZmanim.parasha = zmanim.parasha;
    displayZmanim.isShabbat = zmanim.isShabbat;
    displayZmanim.yomTov = zmanim.yomTov;
    displayZmanim.candleLighting = zmanim.candleLighting;
    // Include havdalah times if they exist
    if (zmanim.havdalah_72) displayZmanim.havdalah_72 = zmanim.havdalah_72;
    if (zmanim.havdalah_8_5) displayZmanim.havdalah_8_5 = zmanim.havdalah_8_5;
    if (zmanim.havdalah_42) displayZmanim.havdalah_42 = zmanim.havdalah_42;
    if (zmanim.havdalah_50) displayZmanim.havdalah_50 = zmanim.havdalah_50;
    if (zmanim.havdalah_60) displayZmanim.havdalah_60 = zmanim.havdalah_60;
    displayZmanim.isFastDay = zmanim.isFastDay;
    displayZmanim.fastName = zmanim.fastName;
    displayZmanim.fastStarts = zmanim.fastStarts;
    displayZmanim.fastEnds = zmanim.fastEnds;
    displayZmanim.omerCount = zmanim.omerCount;
    displayZmanim.isRoshChodesh = zmanim.isRoshChodesh;
    
    return {
      date: today.toISOString(),
      location: settings.cityName,
      zmanim: displayZmanim,
      settings: {
        use24HourFormat: settings.use24HourFormat,
        showSeconds: settings.showSeconds,
        showHebrewDate: settings.showHebrewDate,
        showParasha: settings.showParasha,
      },
    };
  }
}