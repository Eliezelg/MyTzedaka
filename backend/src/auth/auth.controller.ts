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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto,
  ChangePasswordDto,
  AuthResponseDto
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Un utilisateur avec cet email existe déjà' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('register-hub')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur via le hub (sans tenant)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Un utilisateur avec cet email existe déjà' })
  async registerHub(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Pour les utilisateurs du hub, on passe null comme tenantId
    return this.authService.registerHub(registerDto);
  }

  @Public()
  @Post('register-with-association')
  @ApiOperation({ summary: 'Inscription complète : utilisateur + association en une transaction' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' }
          },
          required: ['email', 'password', 'firstName', 'lastName']
        },
        association: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            slug: { type: 'string' },
            domain: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'object' },
            contact: { type: 'object' },
            settings: { type: 'object' }
          },
          required: ['name', 'slug']
        }
      },
      required: ['user', 'association']
    }
  })
  @ApiResponse({ status: 201, description: 'Utilisateur et association créés avec succès' })
  @ApiResponse({ status: 409, description: 'L\'email ou le slug existe déjà' })
  async registerWithAssociation(@Body() data: {
    user: RegisterDto;
    association: any;
  }): Promise<any> {
    console.log('🎯 Controller: registerWithAssociation appelé avec:', data);
    const result = await this.authService.registerWithAssociation(data.user, data.association);
    console.log('✅ Controller: Résultat:', result?.user?.email, result?.tenant?.slug);
    return result;
  }

  @Public()
  @Post('find-user-tenants')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trouver les tenants d\'un utilisateur par email' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Tenants trouvés' })
  async findUserTenants(@Body('email') email: string): Promise<any> {
    return this.authService.findUserTenants(email);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    
    // Optionnel : Stocker le refresh token dans un cookie HttpOnly
    if (loginDto.rememberMe) {
      response.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
      });
    }
    
    return result;
  }

  @Public()
  @Post('login-hub')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur via le hub (sans tenant)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  async loginHub(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    // Pour les utilisateurs du hub, on utilise la méthode loginHub
    const result = await this.authService.loginHub(loginDto);
    
    // Optionnel : Stocker le refresh token dans un cookie HttpOnly
    if (loginDto.rememberMe) {
      response.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
      });
    }
    
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir les tokens JWT' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens rafraîchis avec succès', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) response: Response
  ): Promise<{ message: string }> {
    if (body.refreshToken) {
      await this.authService.logout(body.refreshToken);
    }
    
    // Supprimer le cookie de refresh token
    response.clearCookie('refreshToken');
    
    return { message: 'Déconnexion réussie' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Déconnexion de tous les appareils' })
  @ApiResponse({ status: 200, description: 'Déconnexion de tous les appareils réussie' })
  async logoutAll(
    @Request() req,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ message: string }> {
    await this.authService.logoutAll(req.user.id);
    
    // Supprimer le cookie de refresh token
    response.clearCookie('refreshToken');
    
    return { message: 'Déconnexion de tous les appareils réussie' };
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 401, description: 'Ancien mot de passe incorrect' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Mot de passe changé avec succès' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les informations de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Informations de l\'utilisateur' })
  async getMe(@Request() req): Promise<any> {
    return req.user;
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Valider le token JWT' })
  @ApiResponse({ status: 200, description: 'Token valide' })
  @ApiResponse({ status: 401, description: 'Token invalide ou expiré' })
  async validateToken(): Promise<{ valid: boolean }> {
    return { valid: true };
  }
}