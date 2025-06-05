import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(secretKey, {
      // Version API par défaut
    });

    this.logger.log('Stripe service initialized');
  }

  /**
   * Crée un PaymentIntent pour une donation
   */
  async createPaymentIntent(params: {
    amount: number; // en centimes
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const { amount, currency = 'eur', description, metadata = {} } = params;

      // Validation du montant (minimum 50 centimes = 0.50€)
      if (amount < 50) {
        throw new BadRequestException('Le montant minimum est de 0.50€');
      }

      // Validation du montant maximum (100,000€ pour éviter les erreurs)
      if (amount > 10000000) {
        throw new BadRequestException('Le montant maximum est de 100,000€');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        description,
        metadata: {
          ...metadata,
          source: 'mytzedaka_platform',
          created_at: new Date().toISOString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`PaymentIntent created: ${paymentIntent.id} for ${amount} ${currency}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Error creating PaymentIntent:', error);
      throw error;
    }
  }

  /**
   * Récupère un PaymentIntent par son ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error retrieving PaymentIntent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  /**
   * Confirme un PaymentIntent (si nécessaire côté serveur)
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethodId) {
        params.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        params
      );

      this.logger.log(`PaymentIntent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error confirming PaymentIntent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  /**
   * Annule un PaymentIntent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      this.logger.log(`PaymentIntent cancelled: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error cancelling PaymentIntent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie la signature d'un webhook Stripe
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required for webhook verification');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      
      this.logger.log(`Webhook event verified: ${event.type}`);
      return event;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  /**
   * Crée un remboursement
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason
  ): Promise<Stripe.Refund> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount;
      }

      if (reason) {
        refundParams.reason = reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);
      this.logger.log(`Refund created: ${refund.id} for PaymentIntent ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Error creating refund for ${paymentIntentId}:`, error);
      throw error;
    }
  }

  /**
   * Utilitaire pour convertir les centimes en euros
   */
  static centsToEuros(cents: number): number {
    return Math.round(cents) / 100;
  }

  /**
   * Utilitaire pour convertir les euros en centimes
   */
  static eurosToCents(euros: number): number {
    return Math.round(euros * 100);
  }
}
