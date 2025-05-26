import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class HubStatsDto {
  @ApiProperty({ description: 'Nombre total d\'associations' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalAssociations: number;

  @ApiProperty({ description: 'Nombre d\'associations vérifiées' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  verifiedAssociations: number;

  @ApiProperty({ description: 'Nombre total de campagnes' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalCampaigns: number;

  @ApiProperty({ description: 'Nombre de campagnes actives' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  activeCampaigns: number;

  @ApiProperty({ description: 'Nombre total de dons' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalDonations: number;

  @ApiProperty({ description: 'Montant total des dons' })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  totalAmount: number;
}

export class AssociationSearchDto {
  @ApiPropertyOptional({ description: 'Terme de recherche' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Terme de recherche (alias pour q)' })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ description: 'Catégorie de l\'association' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Localisation de l\'association' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Filtre par associations vérifiées' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  verified?: boolean;

  @ApiPropertyOptional({ description: 'Critère de tri (relevance, name, created_at)' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Numéro de page' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiPropertyOptional({ description: 'Limite de résultats par page' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit?: number;
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

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Date du dernier don' })
  @IsOptional()
  lastDonationAt?: Date;
}

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

export class RecordActivityDto {
  @ApiProperty({ description: 'ID du tenant' })
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Montant du don' })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  donationAmount?: number;

  @ApiPropertyOptional({ description: 'Marquer comme favori' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFavorite?: boolean;
}
