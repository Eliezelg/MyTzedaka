import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { HubJwtStrategy } from './strategies/hub-jwt.strategy';
import { CognitoStrategy } from './strategies/cognito.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HubJwtAuthGuard } from './guards/hub-jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
    PrismaModule,
    TenantModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    HubJwtStrategy, 
    CognitoStrategy,
    JwtAuthGuard,
    HubJwtAuthGuard, 
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, HubJwtAuthGuard, RolesGuard, PassportModule],
})
export class AuthModule {}
