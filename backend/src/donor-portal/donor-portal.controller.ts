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
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HubJwtAuthGuard } from '@/auth/guards/hub-jwt-auth.guard';
import { DonorPortalService } from './donor-portal.service';
import { 
  CreateDonorProfileDto, 
  UpdateDonorProfileDto,
  DonorProfileDto,
  DonorHistoryQueryDto,
  ToggleFavoriteDto
} from './dto/donor-portal.dto';

@ApiTags('donor-portal')
@Controller('donor-portal')
@UseGuards(HubJwtAuthGuard)
@ApiBearerAuth()
export class DonorPortalController {
  constructor(private readonly donorPortalService: DonorPortalService) {}

  @Get('profile/:email')
  @ApiOperation({ summary: 'Récupérer le profil donateur par email' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async getDonorProfile(@Param('email') email: string): Promise<DonorProfileDto> {
    try {
      return await this.donorPortalService.findOrCreateDonorProfile(email);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération du profil donateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('profile')
  @ApiOperation({ summary: 'Créer un profil donateur' })
  @ApiResponse({ status: 201, type: DonorProfileDto })
  async createDonorProfile(@Body() createDto: CreateDonorProfileDto): Promise<DonorProfileDto> {
    try {
      return await this.donorPortalService.createDonorProfile(createDto);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du profil donateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('profile/:email')
  @ApiOperation({ summary: 'Mettre à jour le profil donateur' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async updateDonorProfile(
    @Param('email') email: string,
    @Body() updateDto: UpdateDonorProfileDto
  ): Promise<DonorProfileDto> {
    try {
      return await this.donorPortalService.updateDonorProfile(email, updateDto);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du profil donateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('history/:donorProfileId')
  @ApiOperation({ summary: 'Récupérer l\'historique des dons cross-tenant' })
  @ApiResponse({ status: 200, description: 'Historique des dons avec pagination' })
  async getDonorHistory(
    @Param('donorProfileId') donorProfileId: string,
    @Query() queryDto: DonorHistoryQueryDto
  ) {
    try {
      return await this.donorPortalService.getDonorHistory(donorProfileId, queryDto);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération de l\'historique des dons',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('favorites/:donorProfileId')
  @ApiOperation({ summary: 'Récupérer les associations favorites' })
  @ApiResponse({ status: 200, description: 'Liste des associations favorites' })
  async getFavoriteAssociations(@Param('donorProfileId') donorProfileId: string) {
    try {
      return await this.donorPortalService.getFavoriteAssociations(donorProfileId);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des associations favorites',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('favorites/:donorProfileId')
  @ApiOperation({ summary: 'Ajouter/supprimer une association des favoris' })
  @ApiResponse({ status: 200, description: 'Association favorite mise à jour' })
  async toggleFavoriteAssociation(
    @Param('donorProfileId') donorProfileId: string,
    @Body() toggleDto: ToggleFavoriteDto
  ) {
    try {
      return await this.donorPortalService.toggleFavoriteAssociation(
        donorProfileId, 
        toggleDto.tenantId, 
        toggleDto.action
      );
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour des favoris',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('profile/:email/sync')
  @ApiOperation({ summary: 'Synchroniser les statistiques du profil donateur' })
  @ApiResponse({ status: 200, type: DonorProfileDto })
  async syncDonorProfile(@Param('email') email: string): Promise<DonorProfileDto> {
    try {
      return await this.donorPortalService.syncDonorProfileStats(email);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la synchronisation du profil donateur',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats/:donorProfileId')
  @ApiOperation({ summary: 'Récupérer les statistiques du donateur' })
  @ApiResponse({ status: 200, description: 'Statistiques globales du donateur' })
  async getDonorStats(@Param('donorProfileId') donorProfileId: string) {
    try {
      return await this.donorPortalService.getDonorStats(donorProfileId);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
