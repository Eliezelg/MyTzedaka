import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HubJwtAuthGuard } from './guards/hub-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret-key',
        signOptions: {
          expiresIn: '4h', // Augmenté à 4 heures pour l'administration
        },
      }),
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    JwtAuthGuard,
    HubJwtAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, HubJwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
