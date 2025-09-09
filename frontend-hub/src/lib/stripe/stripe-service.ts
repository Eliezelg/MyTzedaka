import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getAuthHeaders } from '@/lib/security/cookie-auth';

/**
 * Service client Stripe sécurisé pour les paiements
 */

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface DonationRequest {
  amount: number;
  currency?: string;
  campaignId?: string;
  tenantId: string;
  donorInfo?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount?: number;
  };
  parnass?: {
    type: 'day' | 'month' | 'year';
    date: string;
    dedication?: string;
  };
}

class StripeService {
  private static instance: StripeService;
  private stripePromise: Promise<Stripe | null> | null = null;
  private publishableKey: string;

  private constructor() {
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    
    if (!this.publishableKey) {
      console.error('Stripe publishable key not found');
    }
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Obtient l'instance Stripe
   */
  public async getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      this.stripePromise = loadStripe(this.publishableKey);
    }
    return this.stripePromise;
  }

  /**
   * Crée un PaymentIntent pour une donation
   */
  public async createPaymentIntent(donation: DonationRequest): Promise<PaymentIntentResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(donation)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Crée une session de checkout pour un abonnement
   */
  public async createSubscriptionCheckout(params: {
    priceId: string;
    tenantId: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(params)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création de la session');
      }

      const { sessionId } = await response.json();
      
      // Rediriger vers Stripe Checkout
      const stripe = await this.getStripe();
      if (!stripe) throw new Error('Stripe non disponible');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      throw error;
    }
  }

  /**
   * Confirme un paiement avec 3D Secure si nécessaire
   */
  public async confirmPayment(
    clientSecret: string,
    paymentElement: any,
    returnUrl?: string
  ) {
    try {
      const stripe = await this.getStripe();
      if (!stripe) throw new Error('Stripe non disponible');

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/donation/success`
        },
        redirect: returnUrl ? 'if_required' : 'always'
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Récupère le statut d'un PaymentIntent
   */
  public async getPaymentStatus(paymentIntentId: string): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/payment-intent/${paymentIntentId}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du statut');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Annule un PaymentIntent
   */
  public async cancelPayment(paymentIntentId: string): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/payment-intent/${paymentIntentId}/cancel`,
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation du paiement');
      }
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  }

  /**
   * Crée un compte Stripe Connect pour une association
   */
  public async createConnectAccount(params: {
    tenantId: string;
    email: string;
    country?: string;
    businessType?: 'individual' | 'company' | 'non_profit';
  }) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/connect/create-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify(params)
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la création du compte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Connect account:', error);
      throw error;
    }
  }

  /**
   * Obtient le lien d'onboarding pour Stripe Connect
   */
  public async getConnectOnboardingLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
  ) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/connect/onboarding-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            accountId,
            returnUrl,
            refreshUrl
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du lien');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error getting onboarding link:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une association a un compte Stripe valide
   */
  public async checkAccountStatus(tenantId: string): Promise<{
    hasAccount: boolean;
    isActive: boolean;
    requiresAction: boolean;
    mode: 'PLATFORM' | 'CUSTOM';
  }> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/account-status/${tenantId}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du compte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking account status:', error);
      return {
        hasAccount: false,
        isActive: false,
        requiresAction: false,
        mode: 'PLATFORM'
      };
    }
  }

  /**
   * Génère un reçu de donation
   */
  public async generateReceipt(donationId: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donations/${donationId}/receipt`,
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du reçu');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }
}

// Export du singleton
export const stripeService = StripeService.getInstance();

// Export des méthodes utilitaires
export const {
  getStripe,
  createPaymentIntent,
  createSubscriptionCheckout,
  confirmPayment,
  getPaymentStatus,
  cancelPayment,
  createConnectAccount,
  getConnectOnboardingLink,
  checkAccountStatus,
  generateReceipt
} = {
  getStripe: () => stripeService.getStripe(),
  createPaymentIntent: (donation: DonationRequest) => stripeService.createPaymentIntent(donation),
  createSubscriptionCheckout: (params: any) => stripeService.createSubscriptionCheckout(params),
  confirmPayment: (clientSecret: string, paymentElement: any, returnUrl?: string) => 
    stripeService.confirmPayment(clientSecret, paymentElement, returnUrl),
  getPaymentStatus: (paymentIntentId: string) => stripeService.getPaymentStatus(paymentIntentId),
  cancelPayment: (paymentIntentId: string) => stripeService.cancelPayment(paymentIntentId),
  createConnectAccount: (params: any) => stripeService.createConnectAccount(params),
  getConnectOnboardingLink: (accountId: string, returnUrl: string, refreshUrl: string) =>
    stripeService.getConnectOnboardingLink(accountId, returnUrl, refreshUrl),
  checkAccountStatus: (tenantId: string) => stripeService.checkAccountStatus(tenantId),
  generateReceipt: (donationId: string) => stripeService.generateReceipt(donationId)
};

// Hook React personnalisé
export function useStripeService() {
  return stripeService;
}