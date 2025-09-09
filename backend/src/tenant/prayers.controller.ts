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
import { PrayersService, PrayerSettingsDto } from './prayers.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tenant/:tenantId/prayers')
export class PrayersController {
  constructor(
    private readonly prayersService: PrayersService,
  ) {}

  /**
   * Obtenir les paramètres de prières du tenant
   * GET /api/tenant/:tenantId/prayers/settings
   */
  @Get('settings')
  @Public()
  async getSettings(@Param('tenantId') tenantId: string) {
    return await this.prayersService.getSettings(tenantId);
  }

  /**
   * Mettre à jour les paramètres de prières
   * PUT /api/tenant/:tenantId/prayers/settings
   */
  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Param('tenantId') tenantId: string,
    @Body() settings: PrayerSettingsDto,
  ) {
    return await this.prayersService.updateSettings(tenantId, settings);
  }

  /**
   * Obtenir les horaires de prières du jour
   * GET /api/tenant/:tenantId/prayers/today
   */
  @Get('today')
  @Public()
  async getTodayPrayers(@Param('tenantId') tenantId: string) {
    const today = new Date();
    return await this.prayersService.getPrayerTimes(tenantId, today);
  }

  /**
   * Obtenir les horaires pour une date spécifique
   * GET /api/tenant/:tenantId/prayers/date?date=2024-01-15
   */
  @Get('date')
  @Public()
  async getPrayersByDate(
    @Param('tenantId') tenantId: string,
    @Query('date') dateString: string,
  ) {
    const date = dateString ? new Date(dateString) : new Date();
    return await this.prayersService.getPrayerTimes(tenantId, date);
  }

  /**
   * Obtenir les horaires de la semaine
   * GET /api/tenant/:tenantId/prayers/week
   */
  @Get('week')
  @Public()
  async getWeeklyPrayers(
    @Param('tenantId') tenantId: string,
    @Query('startDate') startDateString?: string,
  ) {
    const startDate = startDateString ? new Date(startDateString) : new Date();
    return await this.prayersService.getWeeklySchedule(tenantId, startDate);
  }

  /**
   * Obtenir les horaires du mois
   * GET /api/tenant/:tenantId/prayers/month
   */
  @Get('month')
  @Public()
  async getMonthlyPrayers(
    @Param('tenantId') tenantId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const currentDate = new Date();
    const yearNum = year ? parseInt(year) : currentDate.getFullYear();
    const monthNum = month ? parseInt(month) : currentDate.getMonth() + 1;
    
    return await this.prayersService.getMonthlySchedule(tenantId, yearNum, monthNum);
  }

  /**
   * Générer les horaires pour une période
   * POST /api/tenant/:tenantId/prayers/generate
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async generateSchedule(
    @Param('tenantId') tenantId: string,
    @Body() body: { startDate?: string; days?: number },
  ) {
    const startDate = body.startDate ? new Date(body.startDate) : new Date();
    const days = body.days || 30;
    
    return await this.prayersService.generateSchedule(tenantId, startDate, days);
  }

  /**
   * Obtenir les prochaines prières
   * GET /api/tenant/:tenantId/prayers/next
   */
  @Get('next')
  @Public()
  async getNextPrayers(@Param('tenantId') tenantId: string) {
    const now = new Date();
    const today = await this.prayersService.getPrayerTimes(tenantId, now);
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Trouver la prochaine prière
    const prayers = [
      { name: 'Shaharit', time: today.shaharit },
      { name: 'Minha', time: today.minha },
      { name: 'Arvit', time: today.arvit },
    ].filter(p => p.time && p.time > currentTime);
    
    if (prayers.length === 0) {
      // Si toutes les prières sont passées, prendre celles de demain
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowPrayers = await this.prayersService.getPrayerTimes(tenantId, tomorrow);
      
      return {
        next: {
          name: 'Shaharit',
          time: tomorrowPrayers.shaharit,
          date: tomorrow,
        },
        upcoming: [],
      };
    }
    
    return {
      next: prayers[0],
      upcoming: prayers.slice(1, 3),
      current: today,
    };
  }

  /**
   * Obtenir un résumé pour affichage
   * GET /api/tenant/:tenantId/prayers/display
   */
  @Get('display')
  @Public()
  async getDisplayPrayers(@Param('tenantId') tenantId: string) {
    const today = new Date();
    const prayers = await this.prayersService.getPrayerTimes(tenantId, today);
    const settings = await this.prayersService.getSettings(tenantId);
    
    return {
      date: today.toISOString(),
      prayers: {
        shaharit: prayers.shaharit,
        minha: prayers.minha,
        arvit: prayers.arvit,
        selichot: prayers.selichot,
        musaf: prayers.musaf,
      },
      dayType: prayers.dayType,
      specialName: prayers.specialName,
      notes: prayers.notes,
      settings: {
        calculationMode: settings.calculationMode,
        roundingMode: settings.roundingMode,
        enableNotifications: settings.enableNotifications,
      },
    };
  }
}