import { IsObject, IsString, IsOptional } from 'class-validator';

export class UpdateThemeDto {
  @IsObject()
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    fontFamily: string;
  };
}

export class ThemeConfigDto {
  @IsString()
  primaryColor: string;

  @IsString()
  secondaryColor: string;

  @IsString()
  accentColor: string;

  @IsString()
  backgroundColor: string;

  @IsString()
  textColor: string;

  @IsString()
  borderRadius: string;

  @IsString()
  fontFamily: string;
}