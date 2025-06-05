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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { DonationService } from './donation.service';
import Stripe from 'stripe';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly donationService: DonationService,
  ) {}

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
