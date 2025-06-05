import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Initialise et récupère l'instance Stripe
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
    }

    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Types pour les données de donation
 */
export interface DonationData {
  amount: number; // en euros
  currency?: string;
  campaignId?: string;
  donorEmail?: string;
  donorName?: string;
  isAnonymous?: boolean;
  purpose?: string;
}

/**
 * Réponse de création de donation
 */
export interface CreateDonationResponse {
  success: boolean;
  data: {
    donationId: string;
    clientSecret: string;
    amount: number;
    currency: string;
    campaign?: {
      id: string;
      title: string;
      goal: number;
      raised: number;
    };
  };
}

/**
 * Confirme une donation après paiement réussi
 */
export interface ConfirmDonationResponse {
  success: boolean;
  data: {
    donationId: string;
    amount: number;
    status: string;
    campaign?: {
      id: string;
      title: string;
    };
  };
}

/**
 * Options pour le widget de donation
 */
export interface DonationWidgetOptions {
  campaignId?: string;
  suggestedAmounts?: number[];
  defaultAmount?: number;
  allowCustomAmount?: boolean;
  isAnonymous?: boolean;
  returnUrl?: string;
}
