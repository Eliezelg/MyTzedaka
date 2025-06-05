import { useQuery } from '@tanstack/react-query'
import { CampaignsService, type CampaignsFilters } from '@/lib/services/campaigns-service'
import type { Campaign } from '@/lib/services/associations-service'

const queryKeys = {
  campaignDetail: (id: string) => ['campaign', id] as const,
  campaigns: (filters: any) => ['campaigns', filters] as const,
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaignDetail(id),
    queryFn: async () => {
      if (!id || id === 'undefined') {
        throw new Error('Campaign ID is required')
      }

      const response = await CampaignsService.getCampaign(id)
      return response.data // Extraire les données de la réponse
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

export function useCampaigns(filters: CampaignsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.campaigns(filters),
    queryFn: async () => {
      const response = await CampaignsService.getCampaigns(filters)
      // response contient déjà les données extraites
      return response.data || []
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
