import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

// Types
interface TenantStats {
  totalRaised: number
  monthlyDonations: number
  donationsCount: number
  campaignsCount: number
  activeCampaigns: number
  membersCount: number
  eventsCount: number
}

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  startDate: string
  endDate: string
  isActive: boolean
  donationsCount: number
  imageUrl?: string
}

interface Donation {
  id: string
  amount: number
  donorName: string
  donorEmail: string
  createdAt: string
  campaignId?: string
  campaignName?: string
  paymentMethod: string
  status: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  joinedAt: string
  donationsCount: number
  totalDonated: number
  lastActivity?: string
}

interface TenantSettings {
  name: string
  description: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  websiteUrl?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

// Hook pour récupérer les stats du tenant
export function useTenantStats(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<TenantStats>(`/tenants/${slug}/stats`)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook pour récupérer les campagnes
export function useTenantCampaigns(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug, 'campaigns'],
    queryFn: async () => {
      const response = await apiClient.get<Campaign[]>(`/tenants/${slug}/campaigns`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour créer une campagne
export function useCreateCampaign(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Campaign>) => {
      const response = await apiClient.post(`/tenants/${slug}/campaigns`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'stats'] })
      toast.success('Campagne créée avec succès')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    },
  })
}

// Hook pour mettre à jour une campagne
export function useUpdateCampaign(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Campaign> }) => {
      const response = await apiClient.patch(`/tenants/${slug}/campaigns/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'campaigns'] })
      toast.success('Campagne mise à jour')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
    },
  })
}

// Hook pour supprimer une campagne
export function useDeleteCampaign(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/tenants/${slug}/campaigns/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'stats'] })
      toast.success('Campagne supprimée')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}

// Hook pour récupérer les donations
export function useTenantDonations(slug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['tenant', slug, 'donations', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<{
        donations: Donation[]
        total: number
        page: number
        totalPages: number
      }>(`/tenants/${slug}/donations?page=${page}&limit=${limit}`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer les membres
export function useTenantMembers(slug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['tenant', slug, 'members', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<{
        members: Member[]
        total: number
        page: number
        totalPages: number
      }>(`/tenants/${slug}/members?page=${page}&limit=${limit}`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour inviter un membre
export function useInviteMember(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { email: string; role?: string }) => {
      const response = await apiClient.post(`/tenants/${slug}/members/invite`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'members'] })
      toast.success('Invitation envoyée')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'invitation')
    },
  })
}

// Hook pour récupérer les admins
export function useTenantAdmins(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug, 'admins'],
    queryFn: async () => {
      const response = await apiClient.get<Member[]>(`/tenants/${slug}/admins`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour ajouter un admin
export function useAddAdmin(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post(`/tenants/${slug}/admins`, { email })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'admins'] })
      toast.success('Administrateur ajouté')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout')
    },
  })
}

// Hook pour retirer un admin
export function useRemoveAdmin(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/tenants/${slug}/admins/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'admins'] })
      toast.success('Administrateur retiré')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait')
    },
  })
}

// Hook pour récupérer les paramètres du tenant
export function useTenantSettings(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug, 'settings'],
    queryFn: async () => {
      const response = await apiClient.get<TenantSettings>(`/tenants/${slug}/settings`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour mettre à jour les paramètres
export function useUpdateTenantSettings(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<TenantSettings>) => {
      const response = await apiClient.patch(`/tenants/${slug}/settings`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', slug, 'settings'] })
      queryClient.invalidateQueries({ queryKey: ['tenant', slug] })
      toast.success('Paramètres mis à jour')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
    },
  })
}

// Hook pour récupérer le statut Stripe
export function useTenantStripeStatus(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug, 'stripe'],
    queryFn: async () => {
      const response = await apiClient.get(`/tenants/${slug}/stripe/status`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer les reçus fiscaux
export function useTenantReceipts(slug: string, year?: number) {
  return useQuery({
    queryKey: ['tenant', slug, 'receipts', year],
    queryFn: async () => {
      const params = year ? `?year=${year}` : ''
      const response = await apiClient.get(`/tenants/${slug}/receipts${params}`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer les événements
export function useTenantEvents(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug, 'events'],
    queryFn: async () => {
      const response = await apiClient.get(`/tenants/${slug}/events`)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer l'activité récente
export function useTenantActivity(slug: string, limit = 10) {
  return useQuery({
    queryKey: ['tenant', slug, 'activity', limit],
    queryFn: async () => {
      const response = await apiClient.get(`/tenants/${slug}/activity?limit=${limit}`)
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes car c'est de l'activité récente
  })
}