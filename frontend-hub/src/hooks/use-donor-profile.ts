'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

// Types pour le profil donateur
export interface DonorProfile {
  id: string
  email: string
  cognitoId: string
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
  stats?: {
    totalDonations: number
    totalAmount: number
    averageDonation: number
    associationsCount: number
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
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
      
      const response = await apiClient.get<DonorProfile>(`/donor-portal/profile/${encodeURIComponent(email)}`)
      return response.data
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
      const response = await apiClient.post<DonorProfile>('/donor-portal/profile', data as any)
      return response.data
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
      const response = await apiClient.patch<DonorProfile>(`/donor-portal/profile/${encodeURIComponent(email)}`, data as any)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['donor-profile', data.email], data)
      queryClient.invalidateQueries({ queryKey: ['donor-profile'] })
    },
  })
}

// Hook pour récupérer les favoris d'un donateur
export function useFavoriteAssociations(donorProfileId?: string) {
  return useQuery({
    queryKey: ['donor-favorites', donorProfileId],
    queryFn: async (): Promise<FavoriteAssociation[]> => {
      if (!donorProfileId) throw new Error('Donor profile ID required')
      
      const response = await apiClient.get<FavoriteAssociation[]>(`/donor-portal/favorites/${donorProfileId}`)
      return response.data
    },
    enabled: !!donorProfileId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Hook pour toggle une association favorite
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
      const response = await apiClient.post<any>(`/donor-portal/favorites/${donorProfileId}/toggle`, {
        tenantId,
        action
      })
      return response.data
    },
    onSuccess: (_, { donorProfileId }) => {
      queryClient.invalidateQueries({ queryKey: ['donor-favorites', donorProfileId] })
    },
  })
}

// Hook pour récupérer l'historique des dons
export function useDonorHistory(donorProfileId?: string, query: any = {}) {
  return useQuery({
    queryKey: ['donor-history', donorProfileId, query],
    queryFn: async (): Promise<DonorHistoryResponse> => {
      if (!donorProfileId) throw new Error('Donor profile ID required')
      
      const params = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await apiClient.get<DonorHistoryResponse>(`/donor-portal/history/${donorProfileId}?${params.toString()}`)
      return response.data
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
