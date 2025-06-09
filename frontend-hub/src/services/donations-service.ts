import { apiClient } from '../lib/api-client';

export interface CreateDonationRequest {
  tenantId: string;
  campaignId?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  donorEmail?: string;
  donorName?: string;
}

export interface CreateDonationResponse {
  donation: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentIntentId: string;
    campaignId?: string;
    tenantId: string;
    createdAt: string;
  };
  paymentIntent: {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface ConfirmDonationResponse {
  donation: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentIntentId: string;
    confirmedAt?: string;
  };
  success: boolean;
  message: string;
}

export interface DonationHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentIntentId: string;
  campaignId?: string;
  campaign?: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  confirmedAt?: string;
}

export interface DonationHistoryResponse {
  donations: DonationHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CampaignDonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  uniqueDonors: number;
  recentDonations: number;
  currency: string;
}

class DonationsService {
  /**
   * Crée une nouvelle donation avec PaymentIntent
   */
  async createDonation(request: CreateDonationRequest): Promise<CreateDonationResponse> {
    const response = await apiClient.post<CreateDonationResponse>('/donations/create', request as any);
    return response.data;
  }

  /**
   * Confirme une donation existante
   */
  async confirmDonation(paymentIntentId: string): Promise<ConfirmDonationResponse> {
    const response = await apiClient.post<ConfirmDonationResponse>(`/donations/confirm/${paymentIntentId}`);
    return response.data;
  }

  /**
   * Récupère l'historique des donations de l'utilisateur
   */
  async getDonationHistory(page = 1, limit = 10): Promise<DonationHistoryResponse> {
    const response = await apiClient.get<DonationHistoryResponse>('/donations/history', {
      params: { page, limit } as any
    });
    return response.data;
  }

  /**
   * Récupère les donations d'une campagne spécifique
   */
  async getCampaignDonations(campaignId: string, page = 1, limit = 10): Promise<DonationHistoryResponse> {
    const response = await apiClient.get<DonationHistoryResponse>(`/donations/campaign/${campaignId}`, {
      params: { page, limit } as any
    });
    return response.data;
  }

  /**
   * Récupère les statistiques de donation d'une campagne
   */
  async getCampaignDonationStats(campaignId: string): Promise<CampaignDonationStats> {
    const response = await apiClient.get<CampaignDonationStats>(`/donations/campaign/${campaignId}/stats`);
    return response.data;
  }
}

export const donationsService = new DonationsService();
