import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Put,
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HubJwtAuthGuard } from './guards/hub-jwt-auth.guard';
import { 
  LoginDto, 
  RegisterDto, 
  ResetPasswordDto, 
  ConfirmResetPasswordDto,
  RefreshTokenDto,
  UpdateProfileDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur tenant' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne les tokens JWT' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur tenant' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou utilisateur existant' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-hub')
  @ApiOperation({ summary: 'Inscription utilisateur global (hub)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur global créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou utilisateur existant' })
  async registerHub(@Body() registerDto: RegisterDto) {
    return this.authService.registerHub(registerDto);
  }

  @Post('login-hub')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur global (hub)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion hub réussie, retourne les tokens JWT' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async loginHub(@Body() loginDto: LoginDto) {
    return this.authService.loginHub(loginDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demande de réinitialisation de mot de passe' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Email de réinitialisation envoyé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('confirm-reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmation de réinitialisation de mot de passe' })
  @ApiBody({ type: ConfirmResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
  @ApiResponse({ status: 400, description: 'Code invalide ou expiré' })
  async confirmResetPassword(@Body() confirmResetPasswordDto: ConfirmResetPasswordDto) {
    const { email, code, newPassword } = confirmResetPasswordDto;
    return this.authService.confirmResetPassword(email, code, newPassword);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchissement du token JWT' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Nouveau token généré' })
  @ApiResponse({ status: 401, description: 'Token de rafraîchissement invalide' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(HubJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupération du profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@Request() req) {
    return this.authService.getHubUserProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(HubJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mise à jour du profil utilisateur' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateHubUserProfile(req.user.id, updateProfileDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async logout() {
    // Côté client, supprimer les tokens du localStorage
    return { message: 'Déconnexion réussie' };
  }
}
