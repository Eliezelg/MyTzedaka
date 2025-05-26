import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getCurrentTenant } from '../../tenant/tenant.context';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Vérifier que le tenant est défini
    const tenant = getCurrentTenant();
    if (!tenant) {
      throw new UnauthorizedException('Tenant non identifié');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token invalide ou manquant');
    }

    // Vérifier que l'utilisateur appartient au bon tenant
    const tenant = getCurrentTenant();
    if (tenant && user.tenantId !== tenant.id) {
      throw new UnauthorizedException('Accès refusé : mauvais tenant');
    }

    return user;
  }
}
