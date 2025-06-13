import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class HubJwtStrategy extends PassportStrategy(Strategy, 'hub-jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      // ✅ Utilise la validation spécialisée pour les utilisateurs du hub
      const user = await this.authService.validateHubUser(payload);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token invalide pour utilisateur du hub');
    }
  }
}
