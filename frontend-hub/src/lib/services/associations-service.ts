import { apiClient, type ApiResponse, queryKeys } from '../api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types pour les associations (conformes au backend Prisma)
export interface Association {
  id: string
  name: string
  description: string
  category: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  zipCode?: string
  website?: string
  logoUrl?: string
  bannerUrl?: string
  isVerified: boolean
  isActive: boolean
  donationsCount: number
  totalRaised: number
  createdAt: string
  updatedAt: string
  
  // Relations possibles
  campaigns?: Campaign[]
  donations?: Donation[]
}

export interface Campaign {
  id: string
  title: string
  description: string
  goalAmount: number
  raisedAmount: number
  startDate: string
  endDate?: string
  image?: string
  isActive: boolean
  associationId: string
  association?: Association
}

export interface Donation {
  id: string
  amount: number
  message?: string
  isAnonymous: boolean
  createdAt: string
  donorName?: string
  associationId: string
  campaignId?: string
}

// Filtres pour les associations
export interface AssociationsFilters extends Record<string, string | number | boolean | undefined> {
  category?: string
  city?: string
  country?: string
  isVerified?: boolean
  search?: string
  sortBy?: 'name' | 'totalRaised' | 'donationsCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Statistiques d'une association
export interface AssociationStats {
  donationsCount: number
  totalRaised: number
  campaignsCount: number
  activeCampaignsCount: number
  // Ajouter d'autres statistiques si nécessaire
}

// Service des associations
export class AssociationsService {
  // Récupérer la liste des associations
  static async getAssociations(filters?: AssociationsFilters): Promise<ApiResponse<Association[]>> {
    return apiClient.get<Association[]>('/hub/associations', filters)
  }

  // Récupérer une association par ID
  static async getAssociation(id: string): Promise<ApiResponse<Association>> {
    return apiClient.get<Association>(`/hub/associations/${id}`)
  }

  // Récupérer les campagnes d'une association
  static async getAssociationCampaigns(id: string): Promise<ApiResponse<Campaign[]>> {
    return apiClient.get<Campaign[]>(`/hub/associations/${id}/campaigns`)
  }

  // Récupérer les statistiques d'une association
  static async getAssociationStats(id: string): Promise<ApiResponse<AssociationStats>> {
    return apiClient.get(`/hub/associations/${id}/stats`)
  }

  // Rechercher des associations
  static async searchAssociations(query: string, filters?: Partial<AssociationsFilters>): Promise<ApiResponse<Association[]>> {
    return apiClient.get<Association[]>('/hub/associations/search', {
      q: query,
      ...filters
    })
  }

  // Créer une nouvelle association (admin/auth)
  static async createAssociation(data: Partial<Association>): Promise<ApiResponse<Association>> {
    return apiClient.post<Association>('/hub/associations', data)
  }

  // Mettre à jour une association
  static async updateAssociation(id: string, data: Partial<Association>): Promise<ApiResponse<Association>> {
    return apiClient.patch<Association>(`/hub/associations/${id}`, data)
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
    mutationFn: (data: Partial<Association>) => AssociationsService.createAssociation(data),
    onSuccess: () => {
      // Invalider les caches pour refresh les listes
      queryClient.invalidateQueries({ queryKey: queryKeys.associations })
    },
  })
}

export const useUpdateAssociation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Association> }) => 
      AssociationsService.updateAssociation(id, data),
    onSuccess: (_, variables) => {
      // Invalider les caches spécifiques
      queryClient.invalidateQueries({ queryKey: queryKeys.associationDetail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.associations })
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
