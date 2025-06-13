import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsNumber, 
  IsEnum,
  IsDateString,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDonorProfileDto {
  @ApiProperty({ description: 'Email du donateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ID Cognito' })
  @IsString()
  cognitoId: string;

  @ApiProperty({ description: 'Prénom' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Nom de famille' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Téléphone' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateDonorProfileDto {
  @ApiPropertyOptional({ description: 'Prénom' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Nom de famille' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Téléphone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Devise préférée' })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiPropertyOptional({ description: 'Préférences de communication' })
  @IsOptional()
  communicationPrefs?: any;
}

export class DonorProfileDto {
  @ApiProperty({ description: 'ID du profil donateur' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Email du donateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'ID Cognito' })
  @IsString()
  cognitoId: string;

  @ApiProperty({ description: 'Prénom' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Nom de famille' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Téléphone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Nombre total de dons' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalDonations: number;

  @ApiProperty({ description: 'Montant total des dons' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalAmount: number;

  @ApiProperty({ description: 'Devise préférée' })
  @IsString()
  preferredCurrency: string;

  @ApiPropertyOptional({ description: 'Associations favorites' })
  @IsOptional()
  favoriteAssociations?: string[];

  @ApiPropertyOptional({ description: 'Préférences de communication' })
  @IsOptional()
  communicationPrefs?: any;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Date du dernier don' })
  @IsOptional()
  lastDonationAt?: Date;
}

export class DonorHistoryQueryDto {
  @ApiPropertyOptional({ description: 'Page', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Nombre d\'éléments par page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Date de début (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'ID du tenant pour filtrer' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ 
    description: 'Source du don', 
    enum: ['PLATFORM', 'CUSTOM_SITE', 'API', 'IMPORT'] 
  })
  @IsOptional()
  @IsEnum(['PLATFORM', 'CUSTOM_SITE', 'API', 'IMPORT'])
  source?: string;
}

export class ToggleFavoriteDto {
  @ApiProperty({ description: 'ID du tenant (association)' })
  @IsString()
  tenantId: string;

  @ApiProperty({ 
    description: 'Action à effectuer',
    enum: ['add', 'remove']
  })
  @IsEnum(['add', 'remove'])
  action: 'add' | 'remove';
}

export class DonorHistoryItemDto {
  @ApiProperty({ description: 'ID du don' })
  id: string;

  @ApiProperty({ description: 'Montant du don' })
  amount: number;

  @ApiProperty({ description: 'Devise' })
  currency: string;

  @ApiProperty({ description: 'Source du don' })
  source: string;

  @ApiProperty({ description: 'Date du don' })
  createdAt: Date;

  @ApiProperty({ description: 'Association bénéficiaire' })
  tenant: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiPropertyOptional({ description: 'Campagne liée' })
  campaign?: {
    id: string;
    title: string;
  };

  @ApiPropertyOptional({ description: 'But du don' })
  purpose?: string;

  @ApiProperty({ description: 'Statut du don' })
  status: string;
}

export class DonorHistoryResponseDto {
  @ApiProperty({ description: 'Liste des dons', type: [DonorHistoryItemDto] })
  donations: DonorHistoryItemDto[];

  @ApiProperty({ description: 'Pagination' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  @ApiProperty({ description: 'Statistiques de la période' })
  stats: {
    totalAmount: number;
    totalDonations: number;
    averageDonation: number;
    associationsCount: number;
  };
}

export class DonorStatsDto {
  @ApiProperty({ description: 'Statistiques globales' })
  global: {
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    associationsSupported: number;
    firstDonationDate: Date | null;
    lastDonationDate: Date | null;
  };

  @ApiProperty({ description: 'Statistiques par source' })
  bySources: {
    source: string;
    totalDonations: number;
    totalAmount: number;
    percentage: number;
  }[];

  @ApiProperty({ description: 'Associations favorites' })
  favoriteAssociations: {
    tenantId: string;
    name: string;
    totalDonated: number;
    donationsCount: number;
    lastDonationDate: Date;
  }[];

  @ApiProperty({ description: 'Tendance par mois (12 derniers mois)' })
  monthlyTrend: {
    month: string;
    totalAmount: number;
    donationsCount: number;
  }[];
}
