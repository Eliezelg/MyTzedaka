import { apiClient, ApiResponse } from '../api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Campaign, CampaignsPaginatedResponse, CampaignsFilters } from '@/types/campaign'

// Re-export pour compatibilité
export type { Campaign, CampaignsPaginatedResponse, CampaignsFilters }

// Service des campagnes
export class CampaignsService {
  // Récupérer la liste des campagnes
  static async getCampaigns(filters?: CampaignsFilters): Promise<ApiResponse<CampaignsPaginatedResponse>> {
    return apiClient.get<CampaignsPaginatedResponse>('/hub/campaigns', filters)
  }

  // Récupérer une campagne par ID
  static async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return apiClient.get<Campaign>(`/hub/campaigns/${id}`)
  }

  // Récupérer les statistiques d'une campagne
  static async getCampaignStats(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/hub/campaigns/${id}/stats`)
  }

  // Récupérer les donations d'une campagne
  static async getCampaignDonations(id: string, page = 1, limit = 20): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/hub/campaigns/${id}/donations`, { page, limit })
  }

  // Rechercher des campagnes
  static async searchCampaigns(query: string, filters?: Partial<CampaignsFilters>): Promise<ApiResponse<Campaign[]>> {
    return apiClient.get<Campaign[]>('/hub/campaigns/search', {
      q: query,
      ...filters
    })
  }

  // Créer une nouvelle campagne
  static async createCampaign(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return apiClient.post<Campaign>('/hub/campaigns', data)
  }

  // Mettre à jour une campagne
  static async updateCampaign(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return apiClient.put<Campaign>(`/hub/campaigns/${id}`, data)
  }

  // Supprimer une campagne
  static async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/hub/campaigns/${id}`)
  }

  // Activer/désactiver une campagne
  static async toggleCampaignStatus(id: string, isActive: boolean): Promise<ApiResponse<Campaign>> {
    return apiClient.patch<Campaign>(`/hub/campaigns/${id}/status`, { isActive })
  }

  // Faire un don à une campagne
  static async donateToCampaign(
    campaignId: string, 
    data: {
      amount: number
      message?: string
      isAnonymous?: boolean
      donorName?: string
      donorEmail?: string
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/hub/campaigns/${campaignId}/donate`, data)
  }
}

// Hooks React Query pour les campagnes
export const useCampaigns = (filters?: CampaignsFilters) => {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => CampaignsService.getCampaigns(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => CampaignsService.getCampaignById(id),
    enabled: !!id,
  })
}

export const useCampaignStats = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id, 'stats'],
    queryFn: () => CampaignsService.getCampaignStats(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes pour les stats
  })
}

export const useCampaignDonations = (id: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['campaign', id, 'donations', page, limit],
    queryFn: () => CampaignsService.getCampaignDonations(id, page, limit),
    enabled: !!id,
  })
}

export const useSearchCampaigns = (query: string, filters?: Partial<CampaignsFilters>) => {
  return useQuery({
    queryKey: ['search', 'campaigns', query, filters],
    queryFn: () => CampaignsService.searchCampaigns(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes pour la recherche
  })
}

// Mutations pour créer/modifier/supprimer
export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<Campaign>) => CampaignsService.createCampaign(data),
    onSuccess: (_, variables) => {
      // Invalider les caches pour refresh les listes
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
    },
  })
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) => 
      CampaignsService.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      // Invalider les caches spécifiques
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => CampaignsService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export const useToggleCampaignStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      CampaignsService.toggleCampaignStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export const useDonateToCampaign = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ campaignId, data }: { 
      campaignId: string; 
      data: {
        amount: number
        message?: string
        isAnonymous?: boolean
        donorName?: string
        donorEmail?: string
      }
    }) => CampaignsService.donateToCampaign(campaignId, data),
    onSuccess: (_, variables) => {
      // Invalider les caches pour refresh les données
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId, 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId, 'donations'] })
    },
  })
}

export default CampaignsService
