import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import Stripe from 'stripe';
import { StripeMode } from '@prisma/client';

@Injectable()
export class MultiTenantStripeService {
  private readonly logger = new Logger(MultiTenantStripeService.name);
  private platformStripe: Stripe;
  private stripeInstances: Map<string, Stripe> = new Map();

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {
    // Instance Stripe pour la plateforme MyTzedaka
    this.platformStripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-05-28.basil',
      }
    );
  }

  /**
   * Obtient l'instance Stripe appropriée pour un tenant
   */
  async getStripeInstance(tenantId: string): Promise<Stripe> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { stripeAccount: true },
    });

    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    // Mode PLATFORM - utilise Stripe Connect
    if (tenant.stripeMode === StripeMode.PLATFORM) {
      return this.platformStripe;
    }

    // Mode CUSTOM - utilise le compte Stripe propre
    if (tenant.stripeMode === StripeMode.CUSTOM) {
      if (!tenant.stripeAccount?.stripeSecretKey) {
        throw new Error('Compte Stripe non configuré pour ce tenant');
      }

      // Vérifier si l'instance existe déjà en cache
      if (this.stripeInstances.has(tenantId)) {
        return this.stripeInstances.get(tenantId);
      }

      // Déchiffrer la clé secrète
      const decryptedKey = await this.encryptionService.decrypt(
        tenant.stripeAccount.stripeSecretKey
      );

      // Créer et mettre en cache l'instance Stripe
      const stripeInstance = new Stripe(decryptedKey, {
        apiVersion: '2025-05-28.basil',
      });

      this.stripeInstances.set(tenantId, stripeInstance);
      return stripeInstance;
    }

    throw new Error('Mode Stripe non valide');
  }

  /**
   * Crée un PaymentIntent en fonction du mode du tenant
   */
  async createPaymentIntent(
    tenantId: string,
    amount: number,
    currency: string = 'EUR',
    metadata?: any,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { stripeAccount: true },
    });

    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    const stripe = await this.getStripeInstance(tenantId);

    let paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      metadata: {
        tenantId,
        ...metadata,
      },
    };

    // Mode PLATFORM - ajouter les paramètres Stripe Connect
    if (tenant.stripeMode === StripeMode.PLATFORM) {
      if (!tenant.stripeAccount?.stripeConnectAccountId) {
        throw new Error('Compte Stripe Connect non configuré');
      }

      // Calculer la commission de la plateforme
      const feePercentage = tenant.stripeAccount.feePercentage || 0;
      const applicationFeeAmount = Math.round(amount * Number(feePercentage) / 100 * 100);

      paymentIntentData = {
        ...paymentIntentData,
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: tenant.stripeAccount.stripeConnectAccountId,
        },
      };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
      
      this.logger.log(`PaymentIntent créé: ${paymentIntent.id} pour tenant: ${tenantId}`);
      
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Erreur création PaymentIntent: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirme un PaymentIntent
   */
  async confirmPaymentIntent(
    tenantId: string,
    paymentIntentId: string,
    paymentMethodId: string,
  ) {
    const stripe = await this.getStripeInstance(tenantId);

    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Erreur confirmation PaymentIntent: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Confirme un paiement avec le PaymentIntent spécifié
   */
  async confirmPayment(
    tenantId: string,
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance(tenantId);
    
    const params: Stripe.PaymentIntentConfirmParams = {};
    if (paymentMethodId) {
      params.payment_method = paymentMethodId;
    }

    return stripe.paymentIntents.confirm(paymentIntentId, params);
  }

  /**
   * Récupère les détails d'un PaymentIntent
   */
  async retrievePaymentIntent(tenantId: string, paymentIntentId: string) {
    const stripe = await this.getStripeInstance(tenantId);

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Erreur récupération PaymentIntent: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Récupère un PaymentIntent existant
   */
  async getPaymentIntent(
    tenantId: string,
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance(tenantId);
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Crée un compte Stripe Connect pour un tenant
   */
  async createConnectAccount(tenantId: string, email: string, businessName: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    if (tenant.stripeMode !== StripeMode.PLATFORM) {
      throw new Error('Le tenant n\'utilise pas Stripe Connect');
    }

    try {
      const account = await this.platformStripe.accounts.create({
        type: 'standard',
        country: 'FR',
        email,
        business_profile: {
          name: businessName,
        },
        metadata: {
          tenantId,
        },
      });

      // Sauvegarder l'ID du compte Connect
      await this.prisma.stripeAccount.upsert({
        where: { tenantId },
        update: {
          stripeConnectAccountId: account.id,
          stripeConnectStatus: account.details_submitted ? 'active' : 'pending',
          stripeAccountEmail: email,
          stripeAccountName: businessName,
        },
        create: {
          tenantId,
          stripeConnectAccountId: account.id,
          stripeConnectStatus: account.details_submitted ? 'active' : 'pending',
          stripeAccountEmail: email,
          stripeAccountName: businessName,
        },
      });

      return account;
    } catch (error) {
      this.logger.error(`Erreur création compte Connect: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crée un lien d'onboarding pour Stripe Connect
   */
  async createConnectOnboardingLink(tenantId: string, returnUrl: string, refreshUrl: string) {
    const stripeAccount = await this.prisma.stripeAccount.findUnique({
      where: { tenantId },
    });

    if (!stripeAccount?.stripeConnectAccountId) {
      throw new Error('Compte Connect non trouvé');
    }

    try {
      const accountLink = await this.platformStripe.accountLinks.create({
        account: stripeAccount.stripeConnectAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      this.logger.error(`Erreur création lien onboarding: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Configure un compte Stripe custom pour un tenant
   */
  async configureCustomStripeAccount(
    tenantId: string,
    publishableKey: string,
    secretKey: string,
    webhookSecret?: string,
  ) {
    // Chiffrer les clés sensibles
    const encryptedPublishableKey = await this.encryptionService.encrypt(publishableKey);
    const encryptedSecretKey = await this.encryptionService.encrypt(secretKey);
    const encryptedWebhookSecret = webhookSecret 
      ? await this.encryptionService.encrypt(webhookSecret)
      : null;

    // Vérifier que les clés sont valides
    try {
      const testStripe = new Stripe(secretKey, { apiVersion: '2025-05-28.basil' });
      await testStripe.balance.retrieve();
    } catch (error) {
      throw new Error('Clés Stripe invalides');
    }

    // Sauvegarder les clés chiffrées
    await this.prisma.stripeAccount.upsert({
      where: { tenantId },
      update: {
        stripePublishableKey: encryptedPublishableKey,
        stripeSecretKey: encryptedSecretKey,
        stripeWebhookSecret: encryptedWebhookSecret,
        isActive: true,
        lastVerifiedAt: new Date(),
      },
      create: {
        tenantId,
        stripePublishableKey: encryptedPublishableKey,
        stripeSecretKey: encryptedSecretKey,
        stripeWebhookSecret: encryptedWebhookSecret,
        isActive: true,
        lastVerifiedAt: new Date(),
      },
    });

    // Invalider le cache si existant
    this.stripeInstances.delete(tenantId);

    return { success: true };
  }

  /**
   * Récupère la clé publique Stripe pour un tenant
   */
  async getPublishableKey(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { stripeAccount: true },
    });

    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    // Mode PLATFORM - utilise la clé publique de la plateforme
    if (tenant.stripeMode === StripeMode.PLATFORM) {
      return this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    }

    // Mode CUSTOM - utilise la clé publique du tenant
    if (tenant.stripeMode === StripeMode.CUSTOM) {
      if (!tenant.stripeAccount?.stripePublishableKey) {
        throw new Error('Clé publique Stripe non configurée');
      }

      return await this.encryptionService.decrypt(
        tenant.stripeAccount.stripePublishableKey
      );
    }

    throw new Error('Mode Stripe non valide');
  }

  /**
   * Traite un webhook Stripe
   */
  async handleWebhook(
    tenantId: string,
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { stripeAccount: true },
    });

    if (!tenant) {
      throw new Error('Tenant non trouvé');
    }

    let webhookSecret: string;

    // Mode PLATFORM - utilise le secret webhook de la plateforme
    if (tenant.stripeMode === StripeMode.PLATFORM) {
      webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    } 
    // Mode CUSTOM - utilise le secret webhook du tenant
    else if (tenant.stripeMode === StripeMode.CUSTOM) {
      if (!tenant.stripeAccount?.stripeWebhookSecret) {
        throw new Error('Secret webhook non configuré');
      }
      
      webhookSecret = await this.encryptionService.decrypt(
        tenant.stripeAccount.stripeWebhookSecret
      );
    } else {
      throw new Error('Mode Stripe non valide');
    }

    const stripe = await this.getStripeInstance(tenantId);

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      return event;
    } catch (error) {
      this.logger.error(`Erreur validation webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Vérifie la signature d'un webhook Stripe
   */
  async verifyWebhookSignature(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    // Utiliser le webhook secret de la plateforme principale
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET non configuré');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    });

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      
      this.logger.log(`Webhook vérifié: ${event.type} - ${event.id}`);
      return event;
    } catch (error) {
      this.logger.error(`Erreur vérification signature webhook: ${error.message}`);
      throw new Error(`Signature webhook invalide: ${error.message}`);
    }
  }

  /**
   * Met à jour le statut d'un compte Stripe Connect
   */
  async updateConnectAccountStatus(
    stripeAccountId: string,
    account: Stripe.Account,
  ): Promise<void> {
    try {
      const stripeAccount = await this.prisma.stripeAccount.findFirst({
        where: { stripeConnectAccountId: stripeAccountId },
      });

      if (!stripeAccount) {
        this.logger.warn(`Compte Stripe non trouvé: ${stripeAccountId}`);
        return;
      }

      // Déterminer le statut basé sur les données du compte
      let connectStatus = 'PENDING';
      if (account.charges_enabled && account.payouts_enabled) {
        connectStatus = 'COMPLETE';
      } else if (account.details_submitted) {
        connectStatus = 'RESTRICTED';
      }

      await this.prisma.stripeAccount.update({
        where: { id: stripeAccount.id },
        data: {
          stripeConnectStatus: connectStatus as any,
          isActive: account.charges_enabled || false,
          lastVerifiedAt: new Date(),
        },
      });

      this.logger.log(`Statut compte Connect mis à jour: ${stripeAccountId} -> ${connectStatus}`);
    } catch (error) {
      this.logger.error(
        `Erreur mise à jour statut compte Connect ${stripeAccountId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
