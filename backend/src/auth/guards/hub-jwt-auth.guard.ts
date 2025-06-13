import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT spécialisé pour les endpoints du hub
 * Authentifie l'utilisateur sans exiger la présence d'un tenant
 * Utilise la stratégie 'hub-jwt' qui valide les utilisateurs globaux (tenantId: null)
 */
@Injectable()
export class HubJwtAuthGuard extends AuthGuard('hub-jwt') {
  canActivate(context: ExecutionContext) {
    // ✅ Utilise la stratégie 'hub-jwt' pour valider les utilisateurs du hub
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Si erreur ou pas d'utilisateur, rejeter
    if (err || !user) {
      throw err || new Error('Authentification requise pour utilisateur du hub');
    }
    return user;
  }
}
