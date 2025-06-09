import { apiClient } from '../lib/api-client';

export interface StripeConfig {
  publishableKey: string;
  mode: 'PLATFORM' | 'CUSTOM';
  isConfigured: boolean;
  accountId?: string;
}

export interface ConnectAccountInfo {
  accountId: string;
  status: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface OnboardingLinkResponse {
  url: string;
  expiresAt: string;
}

class StripeService {
  /**
   * Récupère la configuration Stripe d'un tenant
   */
  async getTenantConfig(tenantId: string): Promise<StripeConfig> {
    const response = await apiClient.get<StripeConfig>(`/stripe-config/${tenantId}/config`);
    return response.data;
  }

  /**
   * Récupère la clé publique Stripe d'un tenant
   */
  async getPublishableKey(tenantId: string): Promise<{ publishableKey: string }> {
    const response = await apiClient.get<{ publishableKey: string }>(`/stripe-config/${tenantId}/keys/publishable`);
    return response.data;
  }

  /**
   * Configure le mode Stripe d'un tenant
   */
  async configureTenant(
    tenantId: string, 
    mode: 'PLATFORM' | 'CUSTOM',
    customKeys?: { secretKey: string; publishableKey: string }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/stripe-config/${tenantId}/configure`, {
      mode,
      customKeys
    });
    return response.data;
  }

  /**
   * Récupère les informations du compte Stripe Connect d'un tenant
   */
  async getConnectAccountInfo(tenantId: string): Promise<ConnectAccountInfo> {
    const response = await apiClient.get<ConnectAccountInfo>(`/stripe-config/${tenantId}/connect/account`);
    return response.data;
  }

  /**
   * Crée un compte Stripe Connect pour un tenant
   */
  async createConnectAccount(
    tenantId: string,
    country: string,
    accountType: string
  ): Promise<ConnectAccountInfo> {
    const response = await apiClient.post<ConnectAccountInfo>(`/stripe-config/${tenantId}/connect/account`, {
      country,
      accountType
    });
    return response.data;
  }

  /**
   * Génère un lien d'onboarding Stripe Connect
   */
  async createOnboardingLink(tenantId: string, refreshUrl?: string, returnUrl?: string): Promise<OnboardingLinkResponse> {
    const response = await apiClient.post<OnboardingLinkResponse>(
      `/stripe-config/${tenantId}/connect/onboarding-link`, 
      refreshUrl && returnUrl ? { refreshUrl, returnUrl } : undefined
    );
    return response.data;
  }
}

export const stripeService = new StripeService();
