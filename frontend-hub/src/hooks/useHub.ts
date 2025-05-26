/**
 * React Query hooks pour le Hub Central
 * Gestion optimisée cache, loading, erreurs, mutations
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { hubApiService, HubApiError } from '@/lib/services/hub-api'
import { 
  AssociationsFilters,
  CampaignsFilters,
  SearchFilters
} from '@/lib/types/backend'

// Clés de cache pour React Query
export const HUB_QUERY_KEYS = {
  hub: ['hub'] as const,
  stats: () => [...HUB_QUERY_KEYS.hub, 'stats'] as const,
  associations: () => [...HUB_QUERY_KEYS.hub, 'associations'] as const,
  associationsList: (filters: AssociationsFilters) => 
    [...HUB_QUERY_KEYS.associations(), 'list', filters] as const,
  associationDetail: (id: string) => 
    [...HUB_QUERY_KEYS.associations(), 'detail', id] as const,
  associationMetrics: (id: string) => 
    [...HUB_QUERY_KEYS.associations(), 'metrics', id] as const,
  associationCampaigns: (id: string, filters: Omit<CampaignsFilters, 'associationId'>) =>
    [...HUB_QUERY_KEYS.associations(), id, 'campaigns', filters] as const,
  campaigns: () => [...HUB_QUERY_KEYS.hub, 'campaigns'] as const,
  campaignsList: (filters: CampaignsFilters) => 
    [...HUB_QUERY_KEYS.campaigns(), 'list', filters] as const,
  campaignDetail: (id: string) => 
    [...HUB_QUERY_KEYS.campaigns(), 'detail', id] as const,
  campaignMetrics: (id: string) => 
    [...HUB_QUERY_KEYS.campaigns(), 'metrics', id] as const,
  search: (filters: SearchFilters) => 
    [...HUB_QUERY_KEYS.hub, 'search', filters] as const,
} as const

// Configuration par défaut pour les queries
const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes  
  retry: (failureCount: number, error: unknown) => {
    // Ne pas retry sur les erreurs 404 ou de validation
    if (error instanceof HubApiError && error.status === 404) {
      return false
    }
    return failureCount < 3
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
}

// === HOOKS ASSOCIATIONS ===

/**
 * Hook pour récupérer la liste des associations avec filtres
 */
export function useAssociations(
  filters: AssociationsFilters = {},
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.associationsList(filters),
    queryFn: () => hubApiService.getAssociations(filters),
    ...DEFAULT_QUERY_CONFIG,
    ...options
  })
}

/**
 * Hook pour récupérer une association par ID
 */
export function useAssociation(
  id: string,
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.associationDetail(id),
    queryFn: () => hubApiService.getAssociation(id),
    enabled: Boolean(id),
    ...DEFAULT_QUERY_CONFIG,
    ...options
  })
}

/**
 * Hook pour récupérer les métriques d'une association
 */
export function useAssociationMetrics(
  associationId: string,
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.associationMetrics(associationId),
    queryFn: () => hubApiService.getAssociationMetrics(associationId),
    enabled: Boolean(associationId),
    ...DEFAULT_QUERY_CONFIG,
    ...{
      ...options,
      staleTime: options?.staleTime ?? 2 * 60 * 1000 // 2 minutes pour métriques
    }
  })
}

/**
 * Hook pour récupérer les campagnes d'une association
 */
export function useAssociationCampaigns(
  associationId: string,
  filters: Omit<CampaignsFilters, 'associationId'> = {},
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.associationCampaigns(associationId, filters),
    queryFn: () => hubApiService.getAssociationCampaigns(associationId, filters),
    enabled: Boolean(associationId),
    ...DEFAULT_QUERY_CONFIG,
    ...options
  })
}

/**
 * Hook pour récupérer la liste des campagnes avec filtres
 */
export function useCampaigns(
  filters: CampaignsFilters = {},
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.campaignsList(filters),
    queryFn: () => hubApiService.getCampaigns(filters),
    ...DEFAULT_QUERY_CONFIG,
    ...options
  })
}

/**
 * Hook pour récupérer une campagne par ID
 */
export function useCampaign(
  id: string,
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.campaignDetail(id),
    queryFn: () => hubApiService.getCampaign(id),
    enabled: Boolean(id),
    ...DEFAULT_QUERY_CONFIG,
    ...options
  })
}

/**
 * Hook pour la recherche globale
 */
export function useHubSearch(
  filters: SearchFilters,
  options?: Partial<UseQueryOptions>
) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.search(filters),
    queryFn: () => hubApiService.search(filters),
    enabled: Boolean(filters.query && filters.query.length >= 2),
    ...DEFAULT_QUERY_CONFIG,
    ...{
      ...options,
      staleTime: options?.staleTime ?? 30 * 1000 // 30 secondes pour search
    }
  })
}

// === HOOKS HUB STATS ===

/**
 * Hook pour récupérer les statistiques générales du hub
 */
export function useHubStats(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: HUB_QUERY_KEYS.stats(),
    queryFn: () => hubApiService.getHubStats(),
    ...DEFAULT_QUERY_CONFIG,
    ...options
  })
}
