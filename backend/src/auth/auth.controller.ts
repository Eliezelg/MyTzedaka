import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { 
  LoginDto, 
  RegisterDto, 
  ResetPasswordDto, 
  ConfirmResetPasswordDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-hub')
  async registerHub(@Body() registerDto: RegisterDto) {
    return this.authService.registerHub(registerDto);
  }

  @Post('login-hub')
  @HttpCode(HttpStatus.OK)
  async loginHub(@Body() loginDto: LoginDto) {
    return this.authService.loginHub(loginDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('confirm-reset-password')
  @HttpCode(HttpStatus.OK)
  async confirmResetPassword(@Body() confirmResetPasswordDto: ConfirmResetPasswordDto) {
    const { email, code, newPassword } = confirmResetPasswordDto;
    return this.authService.confirmResetPassword(email, code, newPassword);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // Côté client, supprimer les tokens du localStorage
    return { message: 'Déconnexion réussie' };
  }
}
