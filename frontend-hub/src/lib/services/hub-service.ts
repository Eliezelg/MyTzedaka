import { apiClient, type ApiResponse, queryKeys } from '../api-client'
import { useQuery } from '@tanstack/react-query'
import type { AssociationFromAPI } from '@/types/association-with-campaigns'
import type { Campaign } from '@/types/campaign'

// Types pour les statistiques du Hub
export interface HubStats {
  totalAssociations: number
  totalCampaigns: number
  totalDonations: number
  totalAmount: number
  averageDonation: number
  topCategories: CategoryStat[]
  recentActivity: Activity[]
  monthlyGrowth: MonthlyGrowth[]
}

export interface CategoryStat {
  category: string
  count: number
  totalRaised: number
  percentage: number
}

export interface Activity {
  id: string
  type: 'association_created' | 'campaign_created' | 'donation_made' | 'association_verified'
  title: string
  description: string
  amount?: number
  associationName?: string
  campaignTitle?: string
  createdAt: string
}

export interface MonthlyGrowth {
  month: string
  associations: number
  campaigns: number
  donations: number
  amount: number
}

// Types pour les contenus featured
export interface FeaturedContent {
  featuredAssociations: AssociationFromAPI[]
  featuredCampaigns: Campaign[]
  urgentCampaigns: Campaign[]
  successStories: SuccessStory[]
}

export interface SuccessStory {
  id: string
  title: string
  description: string
  imageUrl: string
  associationId: string
  associationName: string
  impact: string
  createdAt: string
}

// Filtres pour la recherche globale
export interface GlobalSearchFilters extends Record<string, string | number | boolean | undefined> {
  query: string
  type?: 'associations' | 'campaigns' | 'all'
  category?: string
  location?: string
  isVerified?: boolean
  limit?: number
}

export interface GlobalSearchResults {
  associations: AssociationFromAPI[]
  campaigns: Campaign[]
  totalResults: number
  suggestions: string[]
}

// Service du Hub
export class HubService {
  // Récupérer les statistiques globales
  static async getHubStats(): Promise<ApiResponse<HubStats>> {
    return apiClient.get<HubStats>('/api/hub/stats')
  }

  // Récupérer le contenu featured
  static async getFeaturedContent(): Promise<ApiResponse<FeaturedContent>> {
    return apiClient.get<FeaturedContent>('/api/hub/featured')
  }

  // Recherche globale (associations + campagnes)
  static async globalSearch(filters: GlobalSearchFilters): Promise<ApiResponse<GlobalSearchResults>> {
    return apiClient.get<GlobalSearchResults>('/api/hub/search', filters)
  }

  // Récupérer les suggestions de recherche
  static async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/api/hub/search/suggestions', { q: query })
  }

  // Récupérer les catégories disponibles
  static async getCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/api/hub/categories')
  }

  // Récupérer les villes/locations disponibles
  static async getLocations(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/api/hub/locations')
  }

  // Récupérer l'activité récente
  static async getRecentActivity(limit = 10): Promise<ApiResponse<Activity[]>> {
    return apiClient.get<Activity[]>('/api/hub/activity', { limit })
  }

  // Récupérer les success stories
  static async getSuccessStories(limit = 6): Promise<ApiResponse<SuccessStory[]>> {
    return apiClient.get<SuccessStory[]>('/api/hub/success-stories', { limit })
  }

  // Health check du hub
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return apiClient.get('/api/hub/health')
  }
}

// Hooks React Query pour le Hub
export const useHubStats = () => {
  return useQuery({
    queryKey: queryKeys.hubStats(),
    queryFn: () => HubService.getHubStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes pour les stats globales
    gcTime: 1000 * 60 * 30, // 30 minutes en cache
  })
}

export const useFeaturedContent = () => {
  return useQuery({
    queryKey: queryKeys.hubFeatured(),
    queryFn: () => HubService.getFeaturedContent(),
    staleTime: 1000 * 60 * 15, // 15 minutes pour le contenu featured
  })
}

export const useGlobalSearch = (filters: GlobalSearchFilters) => {
  return useQuery({
    queryKey: [...queryKeys.search, 'global', filters],
    queryFn: () => HubService.globalSearch(filters),
    enabled: filters.query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes pour la recherche
  })
}

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: queryKeys.searchSuggestions(query),
    queryFn: () => HubService.getSearchSuggestions(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes pour les suggestions
  })
}

export const useCategories = () => {
  return useQuery({
    queryKey: [...queryKeys.hub, 'categories'],
    queryFn: () => HubService.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes pour les catégories (relativement statiques)
  })
}

export const useLocations = () => {
  return useQuery({
    queryKey: [...queryKeys.hub, 'locations'],
    queryFn: () => HubService.getLocations(),
    staleTime: 1000 * 60 * 30, // 30 minutes pour les locations
  })
}

export const useRecentActivity = (limit = 10) => {
  return useQuery({
    queryKey: [...queryKeys.hub, 'activity', limit],
    queryFn: () => HubService.getRecentActivity(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes pour l'activité récente
  })
}

export const useSuccessStories = (limit = 6) => {
  return useQuery({
    queryKey: [...queryKeys.hub, 'success-stories', limit],
    queryFn: () => HubService.getSuccessStories(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes pour les success stories
  })
}

export const useHealthCheck = () => {
  return useQuery({
    queryKey: [...queryKeys.hub, 'health'],
    queryFn: () => HubService.healthCheck(),
    staleTime: 1000 * 60, // 1 minute pour le health check
    retry: 1, // Peu de retry pour le health check
  })
}

export default HubService
