import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Adresse email de l\'utilisateur', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ description: 'Mot de passe (minimum 8 caractères)', example: 'password123' })
  @IsString({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Adresse email de l\'utilisateur', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ description: 'Mot de passe (minimum 8 caractères)', example: 'password123' })
  @IsString({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiProperty({ description: 'Prénom de l\'utilisateur', example: 'Jean' })
  @IsString({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({ description: 'Nom de famille de l\'utilisateur', example: 'Dupont' })
  @IsString({ message: 'Le nom est requis' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone', example: '+33123456789' })
  @IsOptional()
  @IsPhoneNumber('FR', { message: 'Numéro de téléphone invalide' })
  phone?: string;
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
  @IsString({ message: 'L\'ancien mot de passe est requis' })
  oldPassword: string;

  @IsString({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de rafraîchissement JWT', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString({ message: 'Le token de rafraîchissement est requis' })
  refreshToken: string;
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
