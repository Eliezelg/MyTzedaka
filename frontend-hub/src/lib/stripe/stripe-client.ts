import { loadStripe, Stripe } from '@stripe/stripe-js';

// Cache des instances Stripe par tenant
const stripeInstances: Map<string, Promise<Stripe | null>> = new Map();

/**
 * Initialise et récupère l'instance Stripe pour un tenant spécifique
 */
export const getStripe = async (tenantId?: string): Promise<Stripe | null> => {
  // Si pas de tenantId, utiliser la clé plateforme par défaut
  if (!tenantId) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required');
    }
    return await loadStripe(publishableKey);
  }

  // Vérifier le cache
  if (stripeInstances.has(tenantId)) {
    return await stripeInstances.get(tenantId)!;
  }

  // Créer une nouvelle instance pour ce tenant
  const stripePromise = loadStripeForTenant(tenantId);
  stripeInstances.set(tenantId, stripePromise);
  
  return await stripePromise;
};

/**
 * Charge Stripe avec la clé publique spécifique au tenant
 */
async function loadStripeForTenant(tenantId: string): Promise<Stripe | null> {
  try {
    // Récupérer la clé publique du tenant depuis l'API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe-config/${tenantId}/publishable-key`);
    
    if (!response.ok) {
      throw new Error(`Erreur récupération clé Stripe: ${response.status}`);
    }

    const { publishableKey } = await response.json();
    
    if (!publishableKey) {
      throw new Error('Clé publique Stripe non configurée pour ce tenant');
    }

    return await loadStripe(publishableKey);
  } catch (error) {
    console.error('Erreur initialisation Stripe pour tenant:', tenantId, error);
    throw error;
  }
}

/**
 * Nettoie le cache pour un tenant (utile lors de changements de configuration)
 */
export const clearStripeCache = (tenantId?: string) => {
  if (tenantId) {
    stripeInstances.delete(tenantId);
  } else {
    stripeInstances.clear();
  }
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
