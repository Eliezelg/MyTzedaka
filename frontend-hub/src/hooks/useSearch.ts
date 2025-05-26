import { useQuery } from '@tanstack/react-query'
import { hubApiClient } from '@/lib/hub-client'
import type { SearchResponse } from '@/lib/hub-client'

export function useSearch(
  query: string,
  filters: {
    page?: number
    limit?: number
    category?: string
    type?: 'all' | 'associations' | 'campaigns'
  } = {}
) {
  return useQuery<SearchResponse, Error>({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return {
          associations: { 
            data: [], 
            pagination: { page: 1, limit: 0, total: 0, totalPages: 0, hasNext: false, hasPrev: false } 
          },
          campaigns: { 
            data: [], 
            pagination: { page: 1, limit: 0, total: 0, totalPages: 0, hasNext: false, hasPrev: false } 
          },
          totalResults: 0
        }
      }

      return await hubApiClient.search(query.trim(), filters)
    },
    enabled: !!query && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 secondes pour la recherche
    refetchOnWindowFocus: false,
    retry: false // Pas de retry pour la recherche
  })
}

export function useSearchAssociations(query: string, filters = {}) {
  return useQuery({
    queryKey: ['search-associations', query, filters],
    queryFn: () => hubApiClient.getAssociations({
      ...filters,
      search: query
    }),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  })
}

export function useSearchCampaigns(query: string, filters = {}) {
  return useQuery({
    queryKey: ['search-campaigns', query, filters],
    queryFn: () => hubApiClient.getCampaigns({
      ...filters,
      search: query
    }),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  })
}
