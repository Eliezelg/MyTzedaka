'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

// Types pour le profil donateur
export interface DonorProfile {
  id: string
  email: string
  cognitoId: string
  firstName: string
  lastName: string
  phone?: string
  totalDonations: number
  totalAmount: number
  preferredCurrency: string
  favoriteAssociations: string[] | object
  communicationPrefs: object
  createdAt: string
  updatedAt: string
  lastDonationAt?: string
}

export interface CreateDonorProfileDto {
  email: string
  cognitoId: string
  firstName: string
  lastName: string
  phone?: string
}

export interface UpdateDonorProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  preferences?: {
    emailNotifications: boolean
    donationReceipts: boolean
    newsletterUpdates: boolean
    campaignUpdates: boolean
  }
}

// Hook pour récupérer le profil donateur
export function useDonorProfile(email?: string) {
  return useQuery({
    queryKey: ['donor-profile', email],
    queryFn: async (): Promise<DonorProfile> => {
      if (!email) throw new Error('Email required')
      
      const response = await apiClient.get(`/donor-portal/profile/${encodeURIComponent(email)}`)
      return response as unknown as DonorProfile // L'api-client retourne directement les données
    },
    enabled: !!email,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

// Hook pour créer un profil donateur
export function useCreateDonorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDonorProfileDto): Promise<DonorProfile> => {
      const response = await apiClient.post(`/donor-portal/profile`, data as any)
      return response as unknown as DonorProfile // L'api-client retourne directement les données
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['donor-profile', data.email], data)
      queryClient.invalidateQueries({ queryKey: ['donor-profile'] })
    },
  })
}

// Hook pour mettre à jour le profil donateur
export function useUpdateDonorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      email, 
      data 
    }: { 
      email: string
      data: UpdateDonorProfileDto 
    }): Promise<DonorProfile> => {
      const response = await apiClient.patch(`/donor-portal/profile/${encodeURIComponent(email)}`, data as any)
      return response as unknown as DonorProfile // L'api-client retourne directement les données
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['donor-profile', data.email], data)
      queryClient.invalidateQueries({ queryKey: ['donor-profile'] })
    },
  })
}

// Hook pour récupérer les associations favorites d'un donateur
export function useDonorFavorites(donorProfileId?: string) {
  return useQuery({
    queryKey: ['donor-favorites', donorProfileId],
    queryFn: async (): Promise<FavoriteAssociation[]> => {
      if (!donorProfileId) throw new Error('Donor profile ID required')
      
      const response = await apiClient.get(`/donor-portal/favorites/${donorProfileId}`)
      return response as unknown as FavoriteAssociation[] // L'api-client retourne directement les données
    },
    enabled: !!donorProfileId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Hook pour ajouter/supprimer une association des favoris
export function useToggleFavoriteAssociation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      donorProfileId, 
      tenantId, 
      action = 'toggle' 
    }: { 
      donorProfileId: string
      tenantId: string
      action?: 'add' | 'remove' | 'toggle'
    }): Promise<any> => {
      const response = await apiClient.post(`/donor-portal/favorites/${donorProfileId}/toggle`, {
        tenantId,
        action
      })
      return response as unknown as any // L'api-client retourne directement les données
    },
    onSuccess: (_, { donorProfileId }) => {
      queryClient.invalidateQueries({ queryKey: ['donor-favorites', donorProfileId] })
    },
  })
}

// Hook pour récupérer l'historique des dons d'un donateur
export function useDonorHistory(donorProfileId?: string, options?: {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  tenantId?: string
  source?: string
}) {
  return useQuery({
    queryKey: ['donor-history', donorProfileId, options],
    queryFn: async (): Promise<DonorHistoryResponse> => {
      if (!donorProfileId) throw new Error('Donor profile ID required')
      
      const params = new URLSearchParams({
        page: (options?.page || 1).toString(),
        limit: (options?.limit || 20).toString(),
        ...(options?.startDate && { startDate: options.startDate }),
        ...(options?.endDate && { endDate: options.endDate }),
        ...(options?.tenantId && { tenantId: options.tenantId }),
        ...(options?.source && { source: options.source }),
      })
      
      const response = await apiClient.get(`/donor-portal/history/${donorProfileId}?${params.toString()}`)
      return response as unknown as DonorHistoryResponse // L'api-client retourne directement les données
    },
    enabled: !!donorProfileId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

// Interfaces pour les types de données
interface FavoriteAssociation {
  id: string
  tenantId: string
  donorProfileId: string
  addedAt: string
  tenant: {
    id: string
    name: string
    slug: string
  }
}

interface DonorHistoryResponse {
  donations: DonationHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalAmount: number
    totalDonations: number
    averageDonation: number
    associationsCount: number
  }
}

interface DonationHistoryItem {
  id: string
  amount: number
  currency: string
  status: string
  source: string
  purpose?: string
  createdAt: string
  tenant: {
    id: string
    name: string
    slug: string
  }
  campaign?: {
    id: string
    title: string
    slug: string
  }
}
