import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CountryCode {
  FR = 'FR',
  IL = 'IL',
  US = 'US',
  UK = 'UK',
  CA = 'CA',
}

export class GenerateTaxReceiptDto {
  @ApiProperty({ description: 'ID de la donation' })
  @IsString()
  donationId: string;

  @ApiProperty({ description: 'Code pays pour la législation', enum: CountryCode })
  @IsEnum(CountryCode)
  country: CountryCode;
}

export class TaxReceiptQueryDto {
  @ApiProperty({ description: 'Filtrer par statut', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Date de début', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Date de fin', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}