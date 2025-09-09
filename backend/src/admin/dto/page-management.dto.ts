import { IsBoolean, IsString, IsOptional, IsEnum, IsObject, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export enum PageType {
  STATIC = 'STATIC',
  BLOG = 'BLOG',
  GALLERY = 'GALLERY',
  EVENTS = 'EVENTS',
  FAQ = 'FAQ',
  CONTACT = 'CONTACT',
  CUSTOM = 'CUSTOM'
}

export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export class PageSEODto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImage?: string;
}

export class PageSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showInNavbar?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showInFooter?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireAuth?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  navOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customStyles?: Record<string, any>;
}

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ enum: PageType })
  @IsEnum(PageType)
  type: PageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: PageStatus })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSEODto)
  seo?: PageSEODto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSettingsDto)
  settings?: PageSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePageDto extends PartialType(CreatePageDto) {}

export class PageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ enum: PageType })
  type: PageType;

  @ApiProperty()
  content: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: PageStatus })
  status: PageStatus;

  @ApiProperty()
  seo: PageSEODto;

  @ApiProperty()
  settings: PageSettingsDto;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  views: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  author?: {
    id: string;
    name: string;
  };
}

export class PageListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PageType })
  @IsOptional()
  @IsEnum(PageType)
  type?: PageType;

  @ApiPropertyOptional({ enum: PageStatus })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}


export class NavigationItemDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  children?: NavigationItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  external?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requireAuth?: boolean;
}

export class UpdateNavigationDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  mainMenu: NavigationItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  footerMenu?: NavigationItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NavigationItemDto)
  mobileMenu?: NavigationItemDto[];
}