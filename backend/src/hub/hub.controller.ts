import { Controller, Get, Post, Query, Body, Param, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HubService } from './hub.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HubStatsDto, AssociationSearchDto, DonorProfileDto } from './dto/hub.dto';

@ApiTags('Hub Central')
@Controller('hub')
export class HubController {
  constructor(private readonly hubService: HubService) {}

  @Get('associations')
  @ApiOperation({ summary: 'Récupère toutes les associations publiques' })
  @ApiResponse({ status: 200, description: 'Liste des associations publiques' })
  async getPublicAssociations() {
    return this.hubService.getPublicAssociations();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupère les statistiques globales du hub' })
  @ApiResponse({ status: 200, type: HubStatsDto })
  async getGlobalStats(): Promise<HubStatsDto> {
    return this.hubService.getGlobalStats();
  }

  @Get('campaigns/popular')
  @ApiOperation({ summary: 'Récupère les campagnes populaires cross-tenant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Campagnes populaires' })
  async getPopularCampaigns(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.hubService.getPopularCampaigns(limitNumber);
  }

  @Get('associations/search')
  @ApiOperation({ summary: 'Recherche d\'associations avec pagination et filtres' })
  @ApiResponse({ status: 200, description: 'Associations trouvées avec pagination' })
  async searchAssociations(@Query() searchDto: AssociationSearchDto) {
    return this.hubService.searchAssociations(searchDto);
  }

  @Post('donor/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crée ou met à jour un profil donateur global' })
  @ApiResponse({ status: 201, type: DonorProfileDto })
  async createOrUpdateDonorProfile(@Body() donorData: {
    email: string;
    cognitoId: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return this.hubService.findOrCreateDonorProfile(donorData);
  }

  @Post('donor/:donorId/activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enregistre une activité cross-tenant pour un donateur' })
  @ApiResponse({ status: 201, description: 'Activité enregistrée' })
  async recordDonorActivity(
    @Param('donorId') donorId: string,
    @Body() activityData: {
      tenantId: string;
      donationAmount?: number;
      isFavorite?: boolean;
    }
  ) {
    return this.hubService.recordTenantActivity(
      donorId,
      activityData.tenantId,
      {
        tenantId: activityData.tenantId,
        donationAmount: activityData.donationAmount,
        isFavorite: activityData.isFavorite
      }
    );
  }

  @Get('donor/:donorId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère l\'historique global d\'un donateur' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async getDonorGlobalHistory(@Param('donorId') donorId: string) {
    return this.hubService.getDonorGlobalHistory(donorId);
  }

  @Post('donor/:donorId/update-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Met à jour les statistiques globales d\'un donateur' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async updateDonorGlobalStats(@Param('donorId') donorId: string) {
    return this.hubService.updateDonorGlobalStats(donorId);
  }

  /**
   * Endpoint de test simple pour déboguer
   */
  @Get('test')
  async test() {
    return { message: 'Hub Controller fonctionne !', timestamp: new Date().toISOString() };
  }
}
