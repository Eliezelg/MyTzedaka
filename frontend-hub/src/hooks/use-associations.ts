import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface AssociationFilters {
  page?: number
  limit?: number
  search?: string
  country?: string
  category?: string
  featured?: boolean
}

export interface AssociationListing {
  id: string
  tenantId: string
  slug: string
  name: string
  description?: string
  logo?: string
  location?: string
  country?: string
  category?: string
  email?: string
  phone?: string
  siteUrl?: string
  isActive: boolean
  activeCampaignsCount?: number
  createdAt: string
  tenant: {
    id: string
    name: string
    slug: string
  }
}

export interface PaginatedAssociations {
  data: AssociationListing[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Hook pour récupérer la liste des associations avec filtres
export function useAssociations(filters: AssociationFilters = {}) {
  const { page = 1, limit = 12, search, country, category, featured } = filters

  return useQuery({
    queryKey: ['associations', { page, limit, search, country, category, featured }],
    queryFn: async (): Promise<PaginatedAssociations> => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      
      if (search) params.append('search', search)
      if (country) params.append('country', country)
      if (category) params.append('category', category)
      if (featured !== undefined) params.append('featured', featured.toString())

      const response = await apiClient.get<PaginatedAssociations>(`/hub/associations?${params.toString()}`)
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  })
}

// Hook pour récupérer une association par ID
export function useAssociation(id: string) {
  return useQuery({
    queryKey: ['association', id],
    queryFn: async (): Promise<AssociationListing> => {
      const response = await apiClient.get<AssociationListing>(`/hub/associations/${id}`)
      return response.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Hook pour récupérer une association par slug
export function useAssociationBySlug(slug: string) {
  return useQuery({
    queryKey: ['association', 'by-slug', slug],
    queryFn: async (): Promise<AssociationListing> => {
      const response = await apiClient.get<AssociationListing>(`/hub/associations/by-slug/${slug}`)
      return response.data
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Hook pour créer une nouvelle association
export function useCreateAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<AssociationListing>) => {
      const response = await apiClient.post<AssociationListing>('/hub/associations', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associations'] })
    },
  })
}

// Hook pour mettre à jour une association
export function useUpdateAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AssociationListing> }) => {
      const response = await apiClient.patch<AssociationListing>(`/hub/associations/${id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['association', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['associations'] })
    },
  })
}
