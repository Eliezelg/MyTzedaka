import { useQuery } from '@tanstack/react-query'
import { CampaignsService } from '@/lib/services/campaigns-service'
import { Campaign, CampaignsPaginatedResponse, CampaignsFilters } from '@/types/campaign'
import { ApiResponse } from '@/lib/api-client'

const queryKeys = {
  campaignDetail: (id: string) => ['campaign', id] as const,
  campaigns: (filters: CampaignsFilters) => ['campaigns', filters] as const,
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaignDetail(id),
    queryFn: async () => {
      if (!id || id === 'undefined') {
        throw new Error('Campaign ID is required')
      }

      const response: ApiResponse<Campaign> = await CampaignsService.getCampaignById(id)
      if (response.success) {
        return response.data // Extraire les données de la réponse
      }
      throw new Error(response.message || 'Erreur lors du chargement de la campagne')
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
      const response: ApiResponse<CampaignsPaginatedResponse> = await CampaignsService.getCampaigns(filters)
      if (response.success) {
        // Retourner la structure complète avec campaigns et pagination
        return response.data
      }
      throw new Error(response.message || 'Erreur lors du chargement des campagnes')
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
