import { apiClient, type ApiResponse, queryKeys } from '../api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Campaign } from '@/types/campaign'
import { AssociationFromAPI } from '@/types/association-with-campaigns'

// Types spécifiques au service
export interface AssociationsFilters extends Record<string, string | number | boolean | undefined> {
  category?: string
  city?: string
  isVerified?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface UserAssociation {
  association: AssociationFromAPI
  tenant: {
    id: string
    slug: string
    name: string
  }
  role: string
  isActive: boolean
  joinedAt: string
}

// Service des associations
export class AssociationsService {
  // Récupérer la liste des associations
  static async getAssociations(filters?: AssociationsFilters): Promise<ApiResponse<AssociationFromAPI[]>> {
    return apiClient.get<AssociationFromAPI[]>('/hub/associations', filters)
  }

  // Récupérer une association par ID
  static async getAssociation(id: string): Promise<ApiResponse<AssociationFromAPI>> {
    return apiClient.get<AssociationFromAPI>(`/hub/associations/${id}`)
  }

  // Récupérer une association par slug
  static async getAssociationBySlug(slug: string): Promise<ApiResponse<AssociationFromAPI>> {
    return apiClient.get<AssociationFromAPI>(`/hub/associations/by-slug/${slug}`)
  }

  // Récupérer les campagnes d'une association
  static async getAssociationCampaigns(id: string): Promise<ApiResponse<Campaign[]>> {
    return apiClient.get<Campaign[]>(`/hub/associations/${id}/campaigns`)
  }

  // Récupérer les statistiques d'une association
  static async getAssociationStats(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/hub/associations/${id}/stats`)
  }

  // Rechercher des associations
  static async searchAssociations(query: string, filters?: Partial<AssociationsFilters>): Promise<ApiResponse<AssociationFromAPI[]>> {
    return apiClient.get<AssociationFromAPI[]>('/hub/associations/search', {
      q: query,
      ...filters
    })
  }

  // Créer une nouvelle association (admin/auth)
  static async createAssociation(data: Partial<AssociationFromAPI>): Promise<ApiResponse<AssociationFromAPI>> {
    return apiClient.post<AssociationFromAPI>('/hub/associations', data)
  }

  // Mettre à jour une association
  static async updateAssociation(id: string, data: Partial<AssociationFromAPI>): Promise<ApiResponse<AssociationFromAPI>> {
    return apiClient.patch<AssociationFromAPI>(`/hub/associations/${id}`, data)
  }

  // Supprimer une association
  static async deleteAssociation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hub/associations/${id}`)
  }
}

// Hooks React Query pour les associations
export const useAssociations = (filters?: AssociationsFilters) => {
  return useQuery({
    queryKey: queryKeys.associationsList(filters),
    queryFn: () => AssociationsService.getAssociations(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useAssociation = (id: string) => {
  return useQuery({
    queryKey: queryKeys.associationDetail(id),
    queryFn: async () => {
      const response = await AssociationsService.getAssociation(id)
      return response // L'api-client retourne déjà les données directement
    },
    enabled: !!id,
  })
}

export const useAssociationBySlug = (slug: string) => {
  return useQuery<AssociationFromAPI>({
    queryKey: ['associationDetailBySlug', slug],
    queryFn: async () => {
      console.log('🔍 useAssociationBySlug - Fetching data for slug:', slug)
      const response = await AssociationsService.getAssociationBySlug(slug)
      console.log('🔍 useAssociationBySlug - Raw response:', response)
      console.log('🔍 useAssociationBySlug - Response type:', typeof response)
      console.log('🔍 useAssociationBySlug - Response keys:', Object.keys(response || {}))
      
      // Si l'api-client retourne une structure ApiResponse, extraire .data
      // Sinon, retourner directement la réponse
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('🔍 useAssociationBySlug - Extracting .data from ApiResponse')
        return response.data
      }
      
      return response // Déjà les données directes
    },
    enabled: !!slug,
  })
}

export const useAssociationCampaigns = (id: string) => {
  return useQuery({
    queryKey: queryKeys.associationCampaigns(id),
    queryFn: async () => {
      const response = await AssociationsService.getAssociationCampaigns(id)
      return response // L'api-client retourne déjà les données directement
    },
    enabled: !!id,
  })
}

export const useSearchAssociations = (query: string, filters?: Partial<AssociationsFilters>) => {
  return useQuery({
    queryKey: queryKeys.searchResults(query, filters),
    queryFn: () => AssociationsService.searchAssociations(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes pour la recherche
  })
}

// Mutations pour créer/modifier/supprimer
export const useCreateAssociation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<AssociationFromAPI>) => AssociationsService.createAssociation(data),
    onSuccess: () => {
      // Invalider les caches pour refresh les listes
      queryClient.invalidateQueries({ queryKey: queryKeys.associations })
    },
  })
}

export const useUpdateAssociation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssociationFromAPI> }) => 
      AssociationsService.updateAssociation(id, data),
    onSuccess: (response, variables) => {
      // Invalider les caches spécifiques
      queryClient.invalidateQueries({ queryKey: ['associationDetailBySlug'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.associations })
      queryClient.invalidateQueries({ queryKey: queryKeys.associationDetail(variables.id) })
      
      // Extraire les données de la réponse API
      const updatedAssociation = response.data || response
      if (updatedAssociation?.tenant?.slug) {
        queryClient.setQueryData(['associationDetailBySlug', updatedAssociation.tenant.slug], updatedAssociation)
      }
    },
  })
}

export const useDeleteAssociation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => AssociationsService.deleteAssociation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.associations })
    },
  })
}

export default AssociationsService
