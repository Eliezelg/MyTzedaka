import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @IsString({ message: 'Le prénom est requis' })
  firstName: string;

  @IsString({ message: 'Le nom est requis' })
  lastName: string;

  @IsOptional()
  @IsPhoneNumber('FR', { message: 'Numéro de téléphone invalide' })
  phone?: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}

export class ConfirmResetPasswordDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString({ message: 'Le code de confirmation est requis' })
  code: string;

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
  @IsString({ message: 'Le token de rafraîchissement est requis' })
  refreshToken: string;
}
