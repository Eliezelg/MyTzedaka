import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MultiTenantStripeService } from './multi-tenant-stripe.service';
import { DonationService } from './donation.service';
import Stripe from 'stripe';
import { Request } from 'express';

@ApiTags('stripe-webhook')
@Controller('webhook/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private multiTenantStripeService: MultiTenantStripeService,
    private donationService: DonationService,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Stripe pour tous les tenants' })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  @ApiResponse({ status: 400, description: 'Signature invalide' })
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = request.rawBody;

    if (!payload) {
      this.logger.error('Payload manquant dans le webhook Stripe');
      throw new Error('Payload manquant');
    }

    if (!signature) {
      this.logger.error('Signature manquante dans le webhook Stripe');
      throw new Error('Signature manquante');
    }

    try {
      // Vérifier et construire l'événement Stripe
      const event = await this.multiTenantStripeService.verifyWebhookSignature(
        payload,
        signature,
      );

      this.logger.log(`Webhook reçu: ${event.type} - ${event.id}`);

      // Traiter l'événement selon son type
      await this.processWebhookEvent(event);

      return { received: true };
    } catch (error) {
      this.logger.error(`Erreur webhook Stripe: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Traite les différents types d'événements Stripe
   */
  private async processWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event);
          break;

        case 'account.application.deauthorized':
          await this.handleAccountDeauthorized(event);
          break;

        default:
          this.logger.log(`Événement non traité: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(
        `Erreur traitement événement ${event.type}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Traite la réussite d'un paiement
   */
  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`PaymentIntent réussi: ${paymentIntent.id}`);

    try {
      await this.donationService.confirmDonation(paymentIntent.id);
      this.logger.log(`Donation confirmée pour PaymentIntent: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(
        `Erreur confirmation donation: ${paymentIntent.id}`,
        error.stack,
      );
      // Ne pas lancer l'erreur pour éviter de faire échouer le webhook
    }
  }

  /**
   * Traite l'échec d'un paiement
   */
  private async handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`PaymentIntent échoué: ${paymentIntent.id}`);

    try {
      await this.donationService.failDonation(
        paymentIntent.id,
        paymentIntent.last_payment_error?.message || 'Échec du paiement',
      );
      this.logger.log(`Donation marquée comme échouée: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(
        `Erreur marquage échec donation: ${paymentIntent.id}`,
        error.stack,
      );
    }
  }

  /**
   * Traite l'annulation d'un paiement
   */
  private async handlePaymentIntentCanceled(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`PaymentIntent annulé: ${paymentIntent.id}`);

    try {
      await this.donationService.failDonation(paymentIntent.id, 'Paiement annulé');
      this.logger.log(`Donation marquée comme annulée: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(
        `Erreur marquage annulation donation: ${paymentIntent.id}`,
        error.stack,
      );
    }
  }

  /**
   * Traite la mise à jour d'un compte Stripe Connect
   */
  private async handleAccountUpdated(event: Stripe.Event) {
    const account = event.data.object as Stripe.Account;
    this.logger.log(`Compte Stripe Connect mis à jour: ${account.id}`);

    try {
      await this.multiTenantStripeService.updateConnectAccountStatus(
        account.id,
        account,
      );
      this.logger.log(`Statut compte Connect mis à jour: ${account.id}`);
    } catch (error) {
      this.logger.error(
        `Erreur mise à jour compte Connect: ${account.id}`,
        error.stack,
      );
    }
  }

  /**
   * Traite la déauthorisation d'un compte
   */
  private async handleAccountDeauthorized(event: Stripe.Event) {
    const deauthorization = event.data.object as any;
    this.logger.log(`Compte déautorisé: ${deauthorization.account}`);

    // Marquer le compte comme inactif
    // TODO: Implémenter la logique de déauthorisation
  }
}
