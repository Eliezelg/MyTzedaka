import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StripeService } from '@/lib/stripe/stripe-service';
import type { DonationData } from '@/lib/stripe/stripe-client';

/**
 * Hook pour créer une donation
 */
export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donationData: DonationData) => StripeService.createDonation(donationData),
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

  return useMutation({
    mutationFn: (paymentIntentId: string) => StripeService.confirmDonation(paymentIntentId),
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
  limit?: number;
  offset?: number;
  tenant?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['donations', 'history', params],
    queryFn: () => StripeService.getDonationHistory(params),
    enabled: params?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer les donations d'une campagne
 */
export function useCampaignDonations(campaignId: string, limit?: number) {
  return useQuery({
    queryKey: ['donations', 'campaign', campaignId, limit],
    queryFn: () => StripeService.getCampaignDonations(campaignId, limit),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook pour récupérer les statistiques des donations d'une campagne
 */
export function useCampaignDonationStats(campaignId: string) {
  return useQuery({
    queryKey: ['donations', 'stats', campaignId],
    queryFn: () => StripeService.getCampaignDonationStats(campaignId),
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
