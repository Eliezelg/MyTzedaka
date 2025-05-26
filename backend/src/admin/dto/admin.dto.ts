import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsUUID, IsBoolean, IsNumber, Min, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTenantDto {
  @ApiProperty({ description: 'Nom du tenant' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug unique du tenant' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Domaine du tenant' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ description: 'Email de l\'administrateur principal' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ description: 'Prénom de l\'administrateur' })
  @IsString()
  adminFirstName: string;

  @ApiProperty({ description: 'Nom de l\'administrateur' })
  @IsString()
  adminLastName: string;

  @ApiPropertyOptional({ description: 'Téléphone de l\'administrateur' })
  @IsOptional()
  @IsString()
  adminPhone?: string;

  @ApiPropertyOptional({ description: 'Configuration thème' })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Paramètres tenant' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ description: 'Nom du tenant' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Domaine du tenant' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ description: 'Statut du tenant' })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiPropertyOptional({ description: 'Configuration thème' })
  @IsOptional()
  @IsObject()
  theme?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Paramètres tenant' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class TenantListQueryDto {
  @ApiPropertyOptional({ description: 'Page', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limite par page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Recherche par nom ou slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut' })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiPropertyOptional({ description: 'Ordre de tri', default: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}

export class TenantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  domain?: string;

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

  @ApiPropertyOptional({ description: 'Statistiques du tenant' })
  stats?: {
    users: number;
    donations: number;
    campaigns: number;
    totalAmount: number;
  };
}

export class AdminStatsDto {
  @ApiProperty({ description: 'Nombre total de tenants' })
  totalTenants: number;

  @ApiProperty({ description: 'Nombre de tenants actifs' })
  activeTenants: number;

  @ApiProperty({ description: 'Nombre total d\'utilisateurs' })
  totalUsers: number;

  @ApiProperty({ description: 'Nombre total de dons' })
  totalDonations: number;

  @ApiProperty({ description: 'Montant total des dons' })
  totalAmount: number;

  @ApiProperty({ description: 'Nombre total de campagnes' })
  totalCampaigns: number;

  @ApiProperty({ description: 'Tenants récemment créés', type: [TenantResponseDto] })
  recentTenants: TenantResponseDto[];

  @ApiProperty({ description: 'Statistiques par mois' })
  monthlyStats: {
    month: string;
    tenants: number;
    users: number;
    donations: number;
    amount: number;
  }[];
}

export class DeploymentDto {
  @ApiPropertyOptional({ description: 'Type de déploiement' })
  @IsOptional()
  @IsString()
  type?: 'NETLIFY' | 'S3' | 'CUSTOM';

  @ApiPropertyOptional({ description: 'Configuration de déploiement' })
  @IsOptional()
  @IsObject()
  config?: any;

  @ApiPropertyOptional({ description: 'Forcer le redéploiement' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
