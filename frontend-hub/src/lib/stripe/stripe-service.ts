import { apiClient } from '../api-client';
import type { 
  DonationData, 
  CreateDonationResponse, 
  ConfirmDonationResponse 
} from './stripe-client';

/**
 * Service pour gérer les donations avec Stripe
 */
export class StripeService {
  
  /**
   * Crée une donation et récupère le client secret
   */
  static async createDonation(donationData: DonationData): Promise<CreateDonationResponse> {
    try {
      const response = await apiClient.post('/donations/create', donationData);
      return response.data;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw new Error('Erreur lors de la création de la donation');
    }
  }

  /**
   * Confirme une donation après paiement réussi
   */
  static async confirmDonation(paymentIntentId: string): Promise<ConfirmDonationResponse> {
    try {
      const response = await apiClient.post(`/donations/confirm/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error confirming donation:', error);
      throw new Error('Erreur lors de la confirmation de la donation');
    }
  }

  /**
   * Récupère l'historique des donations de l'utilisateur
   */
  static async getDonationHistory(params?: {
    limit?: number;
    offset?: number;
    tenant?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.tenant) queryParams.append('tenant', params.tenant);

      const response = await apiClient.get(`/donations/history?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation history:', error);
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
  }

  /**
   * Récupère les donations d'une campagne
   */
  static async getCampaignDonations(campaignId: string, limit?: number) {
    try {
      const queryParams = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get(`/donations/campaign/${campaignId}${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign donations:', error);
      throw new Error('Erreur lors de la récupération des donations de la campagne');
    }
  }

  /**
   * Récupère les statistiques des donations d'une campagne
   */
  static async getCampaignDonationStats(campaignId: string) {
    try {
      const response = await apiClient.get(`/donations/campaign/${campaignId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign donation stats:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Utilitaires pour conversion monétaire
   */
  static formatAmount(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static formatAmountSimple(amount: number): string {
    return `${amount.toFixed(2)}€`;
  }
}
