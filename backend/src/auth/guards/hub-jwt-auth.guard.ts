import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class HubJwtAuthGuard extends AuthGuard('jwt') {
  // Utilise la même stratégie JWT mais pourrait avoir des règles différentes pour le hub
}