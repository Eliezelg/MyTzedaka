import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicHub } from '../common/decorators/public-hub.decorator';
import { DonationService, CreateDonationDto } from './donation.service';

@ApiTags('Donations')
@Controller('donations')
export class DonationController {
  private readonly logger = new Logger(DonationController.name);

  constructor(private readonly donationService: DonationService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une donation avec PaymentIntent' })
  @ApiResponse({ status: 201, description: 'Donation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async createDonation(
    @Request() req,
    @Body() createDonationDto: CreateDonationDto,
  ) {
    const { tenantId, userId } = req.user;

    this.logger.log(
      `Creating donation: ${createDonationDto.amount}€ for user ${userId} in tenant ${tenantId}`
    );

    const result = await this.donationService.createDonation(
      tenantId,
      userId,
      createDonationDto,
    );

    return {
      success: true,
      data: {
        donationId: result.donation.id,
        clientSecret: result.clientSecret,
        amount: result.donation.amount,
        currency: result.donation.currency,
        campaign: result.donation.campaign,
      },
    };
  }

  @PublicHub()
  @Post('create-public')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une donation publique depuis le hub (sans authentification)' })
  @ApiResponse({ status: 201, description: 'Donation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async createPublicDonation(
    @Body() createDonationDto: CreateDonationDto & { tenantId: string },
  ) {
    const { tenantId, ...donationData } = createDonationDto;

    if (!tenantId) {
      throw new BadRequestException('tenantId est requis pour une donation publique');
    }

    this.logger.log(
      `Creating public donation: ${donationData.amount}€ for tenant ${tenantId}`
    );

    // Pour les donations publiques, on utilise un userId temporaire ou null
    const result = await this.donationService.createDonation(
      tenantId,
      null, // Pas d'utilisateur connecté pour les donations publiques
      donationData,
    );

    return {
      success: true,
      data: {
        donationId: result.donation.id,
        clientSecret: result.clientSecret,
        amount: result.donation.amount,
        currency: result.donation.currency,
      },
    };
  }

  @Post('confirm/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmer une donation après paiement réussi' })
  @ApiResponse({ status: 200, description: 'Donation confirmée' })
  @ApiResponse({ status: 400, description: 'Paiement non confirmé' })
  @ApiResponse({ status: 404, description: 'Donation non trouvée' })
  async confirmDonation(
    @Request() req,
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    this.logger.log(`Confirming donation for PaymentIntent: ${paymentIntentId}`);

    const donation = await this.donationService.confirmDonation(paymentIntentId);

    return {
      success: true,
      data: {
        donationId: donation.id,
        amount: donation.amount,
        status: donation.status,
        campaign: donation.campaign,
      },
    };
  }

  @PublicHub()
  @Post('confirm-public/:paymentIntentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmer une donation publique après paiement réussi' })
  @ApiResponse({ status: 200, description: 'Donation confirmée' })
  @ApiResponse({ status: 400, description: 'Paiement non confirmé' })
  @ApiResponse({ status: 404, description: 'Donation non trouvée' })
  async confirmPublicDonation(
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    this.logger.log(`Confirming public donation for PaymentIntent: ${paymentIntentId}`);

    const donation = await this.donationService.confirmDonation(paymentIntentId);

    return {
      success: true,
      data: {
        donationId: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status,
      },
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer l\'historique des donations de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Historique récupéré' })
  async getDonationHistory(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('tenant') tenantId?: string,
  ) {
    const { userId } = req.user;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    this.logger.log(`Getting donation history for user ${userId}`);

    const result = await this.donationService.getDonationHistory(
      userId,
      tenantId,
      parsedLimit,
      parsedOffset,
    );

    return {
      success: true,
      data: result.donations,
      pagination: {
        total: result.total,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: result.total > parsedOffset + parsedLimit,
      },
    };
  }

  @Get('campaign/:campaignId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les donations d\'une campagne' })
  @ApiResponse({ status: 200, description: 'Donations de la campagne' })
  async getCampaignDonations(
    @Request() req,
    @Param('campaignId') campaignId: string,
    @Query('limit') limit?: string,
  ) {
    const { tenantId } = req.user;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;

    this.logger.log(`Getting donations for campaign ${campaignId}`);

    const donations = await this.donationService.getCampaignDonations(
      campaignId,
      tenantId,
      parsedLimit,
    );

    return {
      success: true,
      data: donations,
    };
  }

  @Get('campaign/:campaignId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statistiques des donations d\'une campagne' })
  @ApiResponse({ status: 200, description: 'Statistiques de la campagne' })
  async getCampaignDonationStats(
    @Request() req,
    @Param('campaignId') campaignId: string,
  ) {
    const { tenantId } = req.user;

    this.logger.log(`Getting donation stats for campaign ${campaignId}`);

    const stats = await this.donationService.getCampaignDonationStats(
      campaignId,
      tenantId,
    );

    return {
      success: true,
      data: stats,
    };
  }
}
