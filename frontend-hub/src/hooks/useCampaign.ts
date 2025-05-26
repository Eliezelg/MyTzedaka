import { useQuery } from '@tanstack/react-query'
import { hubApiClient } from '@/lib/hub-client'
import type { Campaign } from '@/lib/hub-client'

export function useCampaign(id: string) {
  return useQuery<Campaign, Error>({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (!id || id === 'undefined') {
        throw new Error('Campaign ID is required')
      }

      return await hubApiClient.getCampaignById(id)
    },
    enabled: !!id && id !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Ne pas retry si c'est une erreur 404
      if (error.message?.includes('404')) {
        return false
      }
      return failureCount < 3
    }
  })
}

export function useCampaigns(filters = {}) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => hubApiClient.getCampaigns(filters),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
}

export function useFeaturedCampaigns(limit = 6) {
  return useQuery({
    queryKey: ['featured-campaigns', limit],
    queryFn: () => hubApiClient.getFeaturedCampaigns(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes pour les campagnes en vedette
    refetchOnWindowFocus: false
  })
}

export function useUrgentCampaigns(limit = 6) {
  return useQuery({
    queryKey: ['urgent-campaigns', limit],
    queryFn: () => hubApiClient.getUrgentCampaigns(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes pour les campagnes urgentes
    refetchOnWindowFocus: true // On veut rafraîchir les urgentes
  })
}
