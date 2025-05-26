import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantStatus } from '@prisma/client';

export class UpdateTenantSettingsDto {
  @ApiProperty({ description: 'Configuration thème', required: false })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;

  @ApiProperty({ description: 'Paramètres généraux', required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Nom du tenant', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Domaine personnalisé', required: false })
  @IsOptional()
  @IsString()
  domain?: string;
}

export class TenantInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  domain: string;

  @ApiProperty()
  status: TenantStatus;

  @ApiProperty()
  theme: Record<string, any>;

  @ApiProperty()
  settings: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  stats?: {
    usersCount: number;
    donationsCount: number;
    campaignsCount: number;
    totalAmount: number;
  };
}

export class TenantStatsDto {
  @ApiProperty()
  usersCount: number;

  @ApiProperty()
  donationsCount: number;

  @ApiProperty()
  campaignsCount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  recentActivity: Array<{
    type: string;
    description: string;
    createdAt: Date;
  }>;
}
