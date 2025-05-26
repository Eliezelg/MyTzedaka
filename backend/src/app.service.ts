import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🕍 Plateforme Multi-Tenant pour Communautés Juives - API Ready!';
  }
}
