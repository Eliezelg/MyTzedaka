import { IsEmail, IsString, MinLength, IsOptional, Matches, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ description: 'Adresse email de l\'utilisateur', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ description: 'Mot de passe', example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;

  @ApiPropertyOptional({ description: 'Se souvenir de moi pour 30 jours' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RegisterDto {
  @ApiProperty({ description: 'Adresse email de l\'utilisateur', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ description: 'Mot de passe sécurisé', example: 'SecurePass123!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    }
  )
  password: string;

  @ApiProperty({ description: 'Prénom de l\'utilisateur', example: 'Jean' })
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ description: 'Nom de famille de l\'utilisateur', example: 'Dupont' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone', example: '+33612345678' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({ description: 'ID du tenant' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Adresse email pour la réinitialisation', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}

export class ConfirmResetPasswordDto {
  @ApiProperty({ description: 'Adresse email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ description: 'Code de confirmation reçu par email', example: '123456' })
  @IsString({ message: 'Le code de confirmation est requis' })
  code: string;

  @ApiProperty({ description: 'Nouveau mot de passe (minimum 8 caractères)', example: 'newpassword123' })
  @IsString({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'L\'ancien mot de passe est requis' })
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    }
  )
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de rafraîchissement JWT' })
  @IsString()
  @IsNotEmpty({ message: 'Le token de rafraîchissement est requis' })
  refreshToken: string;
}

// Response DTOs
export class AuthResponseDto {
  @ApiProperty()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
  };

  @ApiProperty()
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// JWT Payload
export class TokenPayload {
  sub: string; // User ID
  email: string;
  tenantId?: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Prénom de l\'utilisateur', example: 'Jean' })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Nom de famille de l\'utilisateur', example: 'Dupont' })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone', example: '+33123456789' })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Première ligne d\'adresse', example: '123 Rue de la Paix' })
  @IsOptional()
  @IsString({ message: 'L\'adresse ligne 1 doit être une chaîne de caractères' })
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Deuxième ligne d\'adresse', example: 'Appartement 4B' })
  @IsOptional()
  @IsString({ message: 'L\'adresse ligne 2 doit être une chaîne de caractères' })
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'Ville', example: 'Paris' })
  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  city?: string;

  @ApiPropertyOptional({ description: 'Code postal', example: '75001' })
  @IsOptional()
  @IsString({ message: 'Le code postal doit être une chaîne de caractères' })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Pays', example: 'France' })
  @IsOptional()
  @IsString({ message: 'Le pays doit être une chaîne de caractères' })
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Préférences utilisateur',
    example: {
      emailNotifications: true,
      donationReceipts: true,
      newsletterUpdates: false,
      campaignUpdates: true
    }
  })
  @IsOptional()
  preferences?: {
    emailNotifications?: boolean;
    donationReceipts?: boolean;
    newsletterUpdates?: boolean;
    campaignUpdates?: boolean;
  };
}
