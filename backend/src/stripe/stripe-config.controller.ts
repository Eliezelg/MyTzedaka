import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

// DTOs
class ConfigureStripeDto {
  mode: 'PLATFORM' | 'CUSTOM';
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  email?: string;
  businessName?: string;
}

class StripeOnboardingDto {
  returnUrl: string;
  refreshUrl: string;
}

@ApiTags('stripe-config')
@Controller('api/stripe-config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StripeConfigController {
  constructor(
    private stripeService: MultiTenantStripeService,
    private prisma: PrismaService,
  ) {}

  @Get('/:tenantId/config')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Récupère la configuration Stripe d\'un tenant' })
  async getStripeConfig(@Param('tenantId') tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { stripeAccount: true },
    });

    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    // Ne pas exposer les clés secrètes
    const config = {
      mode: tenant.stripeMode,
      isConfigured: !!tenant.stripeAccount,
      ...(tenant.stripeAccount && {
        accountName: tenant.stripeAccount.stripeAccountName,
        accountEmail: tenant.stripeAccount.stripeAccountEmail,
        currency: tenant.stripeAccount.currency,
        feePercentage: tenant.stripeAccount.feePercentage,
        isActive: tenant.stripeAccount.isActive,
        connectStatus: tenant.stripeAccount.stripeConnectStatus,
        lastVerifiedAt: tenant.stripeAccount.lastVerifiedAt,
      }),
    };

    return config;
  }

  @Post('/:tenantId/configure')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Configure le mode Stripe pour un tenant' })
  async configureStripe(
    @Param('tenantId') tenantId: string,
    @Body() dto: ConfigureStripeDto,
  ) {
    // Mettre à jour le mode Stripe du tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeMode: dto.mode },
    });

    if (dto.mode === 'PLATFORM') {
      // Créer un compte Stripe Connect
      if (!dto.email || !dto.businessName) {
        throw new Error('Email et nom d\'entreprise requis pour Stripe Connect');
      }

      const account = await this.stripeService.createConnectAccount(
        tenantId,
        dto.email,
        dto.businessName,
      );

      return {
        success: true,
        accountId: account.id,
        message: 'Compte Stripe Connect créé. Veuillez compléter l\'onboarding.',
      };
    } else if (dto.mode === 'CUSTOM') {
      // Configurer un compte Stripe custom
      if (!dto.publishableKey || !dto.secretKey) {
        throw new Error('Clés Stripe requises pour le mode custom');
      }

      await this.stripeService.configureCustomStripeAccount(
        tenantId,
        dto.publishableKey,
        dto.secretKey,
        dto.webhookSecret,
      );

      return {
        success: true,
        message: 'Compte Stripe custom configuré avec succès.',
      };
    }
  }

  @Post('/:tenantId/connect/onboarding')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Génère un lien d\'onboarding Stripe Connect' })
  async createOnboardingLink(
    @Param('tenantId') tenantId: string,
    @Body() dto: StripeOnboardingDto,
  ) {
    const accountLink = await this.stripeService.createConnectOnboardingLink(
      tenantId,
      dto.returnUrl,
      dto.refreshUrl,
    );

    return {
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    };
  }

  @Get('/:tenantId/publishable-key')
  @ApiOperation({ summary: 'Récupère la clé publique Stripe pour le frontend' })
  async getPublishableKey(@Param('tenantId') tenantId: string) {
    const publishableKey = await this.stripeService.getPublishableKey(tenantId);

    return {
      publishableKey,
    };
  }

  @Post('/:tenantId/webhook')
  @ApiOperation({ summary: 'Endpoint webhook Stripe par tenant' })
  async handleWebhook(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ) {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      throw new Error('Signature Stripe manquante');
    }

    const event = await this.stripeService.handleWebhook(
      tenantId,
      req.rawBody,
      signature,
    );

    // Traiter l'événement selon son type
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Logique pour paiement réussi
        console.log('Paiement réussi:', event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        // Logique pour paiement échoué
        console.log('Paiement échoué:', event.data.object);
        break;
      
      case 'account.updated':
        // Mise à jour du statut Stripe Connect
        if (event.account) {
          // D'abord trouver le compte par stripeConnectAccountId
          const stripeAccount = await this.prisma.stripeAccount.findFirst({
            where: { 
              stripeConnectAccountId: event.account as string,
            },
          });
          
          if (stripeAccount) {
            await this.prisma.stripeAccount.update({
              where: { 
                id: stripeAccount.id,
              },
              data: {
                stripeConnectStatus: 'active',
                lastVerifiedAt: new Date(),
              },
            });
          }
        }
        break;
    }

    return { received: true };
  }
}
