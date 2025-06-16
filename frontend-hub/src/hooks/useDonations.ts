import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  donationsService, 
  CreateDonationRequest, 
  CreateDonationResponse,
  ConfirmDonationResponse,
  DonationHistoryResponse,
  CampaignDonationStats 
} from '@/services/donations-service';

/**
 * Hook pour créer une donation
 */
export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation<CreateDonationResponse, Error, CreateDonationRequest & { tenantId: string }>({
    mutationFn: (donationData: CreateDonationRequest & { tenantId: string }) => donationsService.createDonation(donationData),
    onSuccess: () => {
      // Invalidate queries pour actualiser les données
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error) => {
      console.error('Erreur création donation:', error);
    },
  });
}

/**
 * Hook pour confirmer une donation
 */
export function useConfirmDonation() {
  const queryClient = useQueryClient();

  return useMutation<ConfirmDonationResponse, Error, string>({
    mutationFn: (paymentIntentId: string) => donationsService.confirmDonation(paymentIntentId),
    onSuccess: () => {
      // Invalidate queries pour actualiser les données
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error) => {
      console.error('Erreur confirmation donation:', error);
    },
  });
}

/**
 * Hook pour récupérer l'historique des donations
 */
export function useDonationHistory(params?: {
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  return useQuery<DonationHistoryResponse, Error>({
    queryKey: ['donations', 'history', params],
    queryFn: () => donationsService.getDonationHistory(params?.page, params?.limit),
    enabled: params?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer les donations d'une campagne
 */
export function useCampaignDonations(campaignId: string, page?: number, limit?: number) {
  return useQuery<DonationHistoryResponse, Error>({
    queryKey: ['donations', 'campaign', campaignId, page, limit],
    queryFn: () => donationsService.getCampaignDonations(campaignId, page, limit),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer les statistiques des donations d'une campagne
 */
export function useCampaignDonationStats(campaignId: string) {
  return useQuery<CampaignDonationStats, Error>({
    queryKey: ['donations', 'stats', campaignId],
    queryFn: () => donationsService.getCampaignDonationStats(campaignId),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook principal pour les donations (utilisé dans DonationWidget)
 */
export function useDonations() {
  const createDonation = useCreateDonation();
  const confirmDonation = useConfirmDonation();
  
  return {
    createDonation,
    confirmDonation,
    isCreatingDonation: createDonation.isPending,
    isConfirmingDonation: confirmDonation.isPending,
  };
}
