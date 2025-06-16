import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { DonationService } from './donation.service';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HubJwtAuthGuard } from '../auth/guards/hub-jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { GetTenant } from '../tenant/get-tenant.decorator';
import Stripe from 'stripe';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly donationService: DonationService,
    private readonly multiTenantStripeService: MultiTenantStripeService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Récupère le premier tenantId pour un utilisateur (pour les utilisateurs globaux)
   */
  private async getUserDefaultTenantId(userId: string): Promise<string | null> {
    try {
      const membership = await this.prisma.userTenantMembership.findFirst({
        where: {
          userId,
          isActive: true,
          role: {
            in: ['ADMIN', 'MANAGER'] // Seulement les rôles d'administration
          }
        },
        include: {
          tenant: true
        },
        orderBy: {
          joinedAt: 'asc' // Le plus ancien en premier (premier créé)
        }
      });

      return membership?.tenant.id || null;
    } catch (error) {
      this.logger.error(`Erreur getUserDefaultTenantId pour userId ${userId}:`, error);
      return null;
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Exclure de la documentation Swagger
  async handleWebhook(
    @Request() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      // Récupérer le body brut de la requête
      const payload = req.rawBody || req.body;
      
      if (!payload) {
        throw new BadRequestException('Missing request body');
      }

      // Vérifier la signature du webhook
      const event = this.stripeService.verifyWebhookSignature(
        payload.toString(),
        signature,
      );

      this.logger.log(`Webhook received: ${event.type} - ${event.id}`);

      // Traiter les différents types d'événements
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        // Événements Stripe Connect
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        case 'account.application.authorized':
          this.logger.log(`Stripe Connect account authorized: ${(event.data.object as any).id}`);
          break;

        case 'account.application.deauthorized':
          this.logger.warn(`Stripe Connect account deauthorized: ${(event.data.object as any).id}`);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * Gère le succès d'un PaymentIntent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
      
      // Confirmer la donation en base de données
      await this.donationService.confirmDonation(paymentIntent.id);
      
      this.logger.log(`Donation confirmed for PaymentIntent: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Error handling payment success for ${paymentIntent.id}:`, error);
      // Ne pas faire échouer le webhook pour des erreurs internes
    }
  }

  /**
   * Gère l'échec d'un PaymentIntent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Payment failed: ${paymentIntent.id}`);
      
      // Marquer la donation comme échouée
      await this.donationService.failDonation(
        paymentIntent.id,
        paymentIntent.last_payment_error?.message || 'Payment failed',
      );
      
      this.logger.log(`Donation marked as failed for PaymentIntent: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Error handling payment failure for ${paymentIntent.id}:`, error);
    }
  }

  /**
   * Gère l'annulation d'un PaymentIntent
   */
  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Payment canceled: ${paymentIntent.id}`);
      
      // Marquer la donation comme annulée
      await this.donationService.failDonation(
        paymentIntent.id,
        'Payment canceled by user',
      );
      
      this.logger.log(`Donation marked as canceled for PaymentIntent: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Error handling payment cancellation for ${paymentIntent.id}:`, error);
    }
  }

  /**
   * Gère la création d'un litige (dispute)
   */
  private async handleChargeDisputeCreated(dispute: Stripe.Dispute) {
    try {
      this.logger.warn(`Dispute created: ${dispute.id} for charge: ${dispute.charge}`);
      
      // Ici, vous pourriez notifier les administrateurs
      // ou marquer la donation comme en litige
      
      // Pour l'instant, on log simplement l'événement
      this.logger.warn(`Dispute details: ${JSON.stringify({
        id: dispute.id,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
      })}`);
    } catch (error) {
      this.logger.error(`Error handling dispute for ${dispute.id}:`, error);
    }
  }

  /**
   * Gère la mise à jour d'un compte Stripe Connect
   */
  private async handleAccountUpdated(account: Stripe.Account) {
    try {
      this.logger.log(`Stripe Connect account updated: ${account.id}`);
      
      // Mettre à jour le statut du compte dans la base de données
      await this.multiTenantStripeService.updateConnectAccountStatus(account.id, account);
      
      this.logger.log(`Account status updated for: ${account.id}`);
    } catch (error) {
      this.logger.error(`Error handling account update for ${account.id}:`, error);
    }
  }

  @Get('connect/onboarding')
  @UseGuards(HubJwtAuthGuard)
  @ApiOperation({ summary: 'Génère un lien d\'onboarding Stripe Connect' })
  @ApiResponse({ status: 200, description: 'Lien d\'onboarding généré' })
  async createOnboardingLink(
    @GetUser() user: any,
    @Query('returnUrl') returnUrl: string,
    @Query('tenantId') tenantId?: string,
    @Query('locale') locale = 'fr',
  ) {
    try {
      // Si tenantId n'est pas fourni, récupérer depuis les associations de l'utilisateur
      let targetTenantId = tenantId;
      
      if (!targetTenantId) {
        // Récupérer le tenant par défaut de l'utilisateur
        targetTenantId = user.tenantId || await this.getUserDefaultTenantId(user.id);
        if (!targetTenantId) {
          throw new BadRequestException('Aucune association trouvée pour cet utilisateur. Veuillez spécifier un tenantId.');
        }
      }
      
      // Vérifier que l'utilisateur a accès à ce tenant (sauf si c'est son tenant principal)
      if (user.tenantId !== targetTenantId) {
        const membership = await this.prisma.userTenantMembership.findFirst({
          where: {
            userId: user.id,
            tenantId: targetTenantId,
            isActive: true,
            role: {
              in: ['ADMIN', 'MANAGER'] // Seuls les administrateurs peuvent configurer Stripe
            }
          }
        });
        
        if (!membership) {
          throw new BadRequestException('Accès non autorisé à cette association');
        }
      }
      
      // Récupérer le slug de l'association
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: targetTenantId },
        include: { associationListing: true }
      });
      
      if (!tenant || !tenant.associationListing) {
        throw new BadRequestException('Association non trouvée');
      }
      
      const slug = tenant.slug;
      
      // URLs de retour après l'onboarding
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const successUrl = returnUrl || `${baseUrl}/${locale}/associations/${slug}/dashboard`;
      const refreshUrl = `${baseUrl}/${locale}/associations/${slug}/stripe-onboarding`;

      // Générer le lien d'onboarding
      const accountLink = await this.multiTenantStripeService.createConnectOnboardingLink(
        targetTenantId,
        successUrl,
        refreshUrl,
      );

      return {
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
      };
    } catch (error) {
      this.logger.error('Error creating onboarding link:', error);
      throw new BadRequestException('Impossible de créer le lien d\'onboarding');
    }
  }

  @Get('connect/status')
  @UseGuards(HubJwtAuthGuard)
  @ApiOperation({ summary: 'Vérifie le statut d\'un compte Stripe Connect' })
  @ApiResponse({ status: 200, description: 'Statut du compte' })
  async getConnectAccountStatus(
    @GetUser() user: any,
    @Query('tenantId') tenantId?: string,
  ) {
    try {
      // Si tenantId n'est pas fourni, récupérer depuis les associations de l'utilisateur
      let targetTenantId = tenantId;
      
      if (!targetTenantId) {
        // Récupérer le tenant par défaut de l'utilisateur
        targetTenantId = user.tenantId || await this.getUserDefaultTenantId(user.id);
        if (!targetTenantId) {
          return {
            hasAccount: false,
            status: 'NOT_CREATED',
            error: 'Aucune association trouvée pour cet utilisateur',
          };
        }
      }
      
      // Vérifier que l'utilisateur a accès à ce tenant (sauf si c'est son tenant principal)
      if (user.tenantId !== targetTenantId) {
        const membership = await this.prisma.userTenantMembership.findFirst({
          where: {
            userId: user.id,
            tenantId: targetTenantId,
            isActive: true,
            role: {
              in: ['ADMIN', 'MANAGER'] // Seuls les administrateurs peuvent voir le statut Stripe
            }
          }
        });
        
        if (!membership) {
          throw new BadRequestException('Accès non autorisé à cette association');
        }
      }
      
      // Récupérer les informations du compte depuis la base de données
      const account = await this.stripeService.getStripeAccountByTenantId(targetTenantId);
      
      if (!account) {
        return {
          hasAccount: false,
          status: 'NOT_CREATED',
        };
      }

      return {
        hasAccount: true,
        status: account.stripeConnectStatus,
        isActive: account.isActive,
        requiresOnboarding: account.stripeConnectStatus?.toLowerCase() === 'pending',
      };
    } catch (error) {
      this.logger.error('Error getting account status:', error);
      throw new BadRequestException('Impossible de récupérer le statut du compte');
    }
  }

  @Get('user/associations')
  @UseGuards(HubJwtAuthGuard)
  @ApiOperation({ summary: 'Récupère les associations d\'un utilisateur pour Stripe' })
  @ApiResponse({ status: 200, description: 'Liste des associations' })
  async getUserAssociations(@GetUser() user: any) {
    try {
      const memberships = await this.prisma.userTenantMembership.findMany({
        where: {
          userId: user.id,
          isActive: true,
          role: {
            in: ['ADMIN', 'MANAGER']
          }
        },
        include: {
          tenant: {
            include: {
              associationListing: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                }
              }
            }
          }
        }
      });

      return {
        associations: memberships
          .filter(m => m.tenant.associationListing)
          .map(m => ({
            tenantId: m.tenant.id,
            name: m.tenant.associationListing.name,
            slug: m.tenant.slug,
            logoUrl: m.tenant.associationListing.logoUrl,
            role: m.role,
            isDefault: memberships[0]?.tenant.id === m.tenant.id // Premier = défaut
          }))
      };
    } catch (error) {
      this.logger.error('Error getting user associations:', error);
      throw new BadRequestException('Impossible de récupérer les associations');
    }
  }

  @Post('connect/create-account')
  @UseGuards(HubJwtAuthGuard)
  @ApiOperation({ summary: 'Crée un compte Stripe Connect pour une association' })
  @ApiResponse({ status: 200, description: 'Compte Stripe Connect créé' })
  async createConnectAccount(
    @GetUser() user: any,
    @Query('tenantId') tenantId?: string,
  ) {
    try {
      // Si tenantId n'est pas fourni, récupérer depuis les associations de l'utilisateur
      let targetTenantId = tenantId;
      
      if (!targetTenantId) {
        // Récupérer le tenant par défaut de l'utilisateur
        targetTenantId = user.tenantId || await this.getUserDefaultTenantId(user.id);
        if (!targetTenantId) {
          throw new BadRequestException('Aucune association trouvée pour cet utilisateur. Veuillez spécifier un tenantId.');
        }
      }
      
      // Vérifier que l'utilisateur a accès à ce tenant (sauf si c'est son tenant principal)
      if (user.tenantId !== targetTenantId) {
        const membership = await this.prisma.userTenantMembership.findFirst({
          where: {
            userId: user.id,
            tenantId: targetTenantId,
            isActive: true,
            role: {
              in: ['ADMIN', 'MANAGER'] // Seuls les administrateurs peuvent créer un compte Stripe
            }
          }
        });
        
        if (!membership) {
          throw new BadRequestException('Accès non autorisé à cette association');
        }
      }
      
      // Vérifier qu'il n'y a pas déjà un compte
      const existingAccount = await this.stripeService.getStripeAccountByTenantId(targetTenantId);
      if (existingAccount) {
        throw new BadRequestException('Un compte Stripe Connect existe déjà pour cette association');
      }
      
      // Récupérer les informations de l'association
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: targetTenantId },
        include: { associationListing: true }
      });
      
      if (!tenant || !tenant.associationListing) {
        throw new BadRequestException('Association non trouvée');
      }
      
      // Créer le compte Stripe Connect
      const stripeAccount = await this.multiTenantStripeService.createConnectAccount(
        targetTenantId,
        tenant.associationListing.email,
        tenant.associationListing.name
      );
      
      this.logger.log(`Compte Stripe Connect créé manuellement pour ${tenant.associationListing.name}: ${stripeAccount.id}`);
      
      return {
        success: true,
        accountId: stripeAccount.id,
        status: 'PENDING',
        message: 'Compte Stripe Connect créé avec succès. Vous pouvez maintenant procéder à la configuration.'
      };
    } catch (error) {
      this.logger.error('Error creating Stripe Connect account:', error);
      throw new BadRequestException('Impossible de créer le compte Stripe Connect');
    }
  }

  @Post('test-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test endpoint pour vérifier la configuration webhook' })
  @ApiResponse({ status: 200, description: 'Configuration webhook OK' })
  async testWebhook() {
    this.logger.log('Test webhook endpoint called');
    
    return {
      success: true,
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString(),
    };
  }
}
