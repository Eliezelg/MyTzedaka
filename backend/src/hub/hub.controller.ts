import { Controller, Get, Post, Query, Body, Param, UseGuards, Put, Delete, Patch, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HubService } from './hub.service';
import { HubJwtAuthGuard } from '../auth/guards/hub-jwt-auth.guard';
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

  @Get('associations/:id')
  @ApiOperation({ summary: 'Récupère les détails d\'une association' })
  @ApiResponse({ status: 200, description: 'Détails de l\'association' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async getAssociationById(@Param('id') id: string) {
    return this.hubService.getAssociationById(id);
  }

  @Get('associations/by-slug/:slug')
  @ApiOperation({ summary: 'Récupère les détails d\'une association par slug' })
  @ApiResponse({ status: 200, description: 'Détails de l\'association' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async getAssociationBySlug(@Param('slug') slug: string) {
    return this.hubService.getAssociationBySlug(slug);
  }

  @Get('my-associations')
  @UseGuards(HubJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère les associations de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Liste des associations dont l\'utilisateur est membre/admin' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getMyAssociations(@Request() req) {
    const userId = req.user.id;
    return this.hubService.getMyAssociations(userId);
  }

  @Post('associations')
  @UseGuards(HubJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crée une nouvelle association' })
  @ApiResponse({ status: 201, description: 'Association créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async createAssociation(
    @Body() associationData: {
      name: string;
      description?: string;
      category?: string;
      email: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
      website?: string;
      // Configuration Stripe
      stripeMode?: 'PLATFORM' | 'CUSTOM';
      stripeSecretKey?: string;
      stripePublishableKey?: string;
      // Objet de l'association
      associationPurpose?: string;
      // Données progressives additionnelles
      legalInfo?: any;
      contactInfo?: any;
      additionalInfo?: any;
    },
    @Request() req
  ) {
    // userId extrait automatiquement du token JWT
    const userId = req.user.id;
    
    return this.hubService.createAssociation({
      ...associationData,
      userId // Injecté automatiquement côté serveur
    });
  }

  @Patch('associations/:id')
  @ApiOperation({ summary: 'Mettre à jour une association' })
  @ApiParam({ name: 'id', description: 'ID de l\'association' })
  @ApiResponse({ status: 200, description: 'Association mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async updateAssociation(
    @Param('id') id: string,
    @Body() updateData: {
      name?: string
      description?: string
      email?: string
      phone?: string
      siteUrl?: string
      city?: string
      country?: string
      location?: string
      category?: string
    }
  ) {
    console.log(' [PATCH /associations/:id] Mise à jour association:', { id, updateData })
    
    try {
      const updatedAssociation = await this.hubService.updateAssociation(id, updateData)
      console.log(' [PATCH /associations/:id] Association mise à jour:', updatedAssociation.id)
      return updatedAssociation
    } catch (error) {
      console.error(' [PATCH /associations/:id] Erreur:', error.message)
      throw error
    }
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

  @Get('campaigns')
  @ApiOperation({ summary: 'Récupère les campagnes publiques avec pagination et filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page (défaut: 12, max: 50)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche textuelle' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrer par catégorie' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Statut de la campagne (défaut: ACTIVE)' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean, description: 'Campagnes mises en avant' })
  @ApiQuery({ name: 'urgent', required: false, type: Boolean, description: 'Campagnes urgentes' })
  @ApiResponse({ status: 200, description: 'Liste paginée des campagnes' })
  async getCampaigns(@Query() query: any) {
    return this.hubService.getCampaigns(query);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Récupère les détails d\'une campagne' })
  @ApiResponse({ status: 200, description: 'Détails de la campagne' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async getCampaignById(@Param('id') id: string) {
    return this.hubService.getCampaignById(id);
  }

  @Get('associations/search')
  @ApiOperation({ summary: 'Recherche d\'associations avec pagination et filtres' })
  @ApiResponse({ status: 200, description: 'Associations trouvées avec pagination' })
  async searchAssociations(@Query() searchDto: AssociationSearchDto) {
    return this.hubService.searchAssociations(searchDto);
  }

  @Post('donor/profile')
  @UseGuards(HubJwtAuthGuard)
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
  @UseGuards(HubJwtAuthGuard)
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
  @UseGuards(HubJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère l\'historique global d\'un donateur' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async getDonorGlobalHistory(@Param('donorId') donorId: string) {
    return this.hubService.getDonorGlobalHistory(donorId);
  }

  @Post('donor/:donorId/update-stats')
  @UseGuards(HubJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Met à jour les statistiques globales d\'un donateur' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async updateDonorGlobalStats(@Param('donorId') donorId: string) {
    return this.hubService.updateDonorGlobalStats(donorId);
  }

  @Get('test-stripe')
  @ApiOperation({ summary: 'Test route Stripe' })
  async testStripe() {
    return { message: 'Route Stripe fonctionnelle' };
  }

  @Get('stripe/:tenantId/publishable-key')
  @ApiOperation({ summary: 'Récupère la clé publique Stripe pour un tenant (route publique)' })
  @ApiResponse({ status: 200, description: 'Clé publique Stripe' })
  async getTenantStripePublishableKey(@Param('tenantId') tenantId: string) {
    return this.hubService.getTenantStripePublishableKey(tenantId);
  }

  @Post('test-user')
  @ApiOperation({ summary: 'Crée un utilisateur de test (développement uniquement)' })
  async createTestUser(@Body() userData: {
    email: string;
    firstName: string;
    lastName: string;
    cognitoId: string;
  }) {
    return this.hubService.createTestUser(userData);
  }

  @Get('associations/:tenantId/admins')
  @ApiOperation({ summary: 'Récupère la liste des administrateurs d\'une association' })
  async getAssociationAdmins(@Param('tenantId') tenantId: string) {
    return this.hubService.getAssociationAdmins(tenantId);
  }

  @Post('associations/:tenantId/admins')
  @ApiOperation({ summary: 'Ajoute un administrateur à une association' })
  async addAssociationAdmin(
    @Param('tenantId') tenantId: string,
    @Body() adminData: {
      email: string;
      role?: string;
    }
  ) {
    return this.hubService.addAssociationAdmin(tenantId, adminData);
  }

  @Delete('associations/:tenantId/admins/:userId')
  @ApiOperation({ summary: 'Retire un administrateur d\'une association' })
  async removeAssociationAdmin(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string
  ) {
    return this.hubService.removeAssociationAdmin(tenantId, userId);
  }

  /**
   * Endpoint de test simple pour déboguer
   */
  @Get('test')
  async test() {
    return { message: 'Hub Controller fonctionne !', timestamp: new Date().toISOString() };
  }
}
