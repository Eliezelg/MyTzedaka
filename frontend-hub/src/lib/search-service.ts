import { Association, Campaign } from '@/types/hub'

export interface SearchResult {
  type: 'association' | 'campaign'
  id: string
  title: string
  description: string
  category?: string
  location?: string
  verified?: boolean
  progress?: number
  target?: number
  urgency?: 'low' | 'medium' | 'high'
  data: Association | Campaign
}

export interface FederatedSearchParams {
  query: string
  types?: ('association' | 'campaign')[]
  category?: string
  location?: string
  verified?: boolean
  sortBy?: string
  limit?: number
  includeAssociations?: boolean
  includeCampaigns?: boolean
}

export interface FederatedSearchResponse {
  results: SearchResult[]
  total: number
  breakdown: {
    associations: number
    campaigns: number
  }
  suggestions: string[]
  queryTime: number
}

export interface AutocompleteResponse {
  suggestions: SuggestionItem[]
  recent: SearchHistoryItem[]
}

export type SearchHistoryItem = {
  text: string
  type: 'association' | 'campaign' | 'general'
  resultCount?: number
  timestamp: number
}

export type SuggestionItem = {
  text: string
  type: 'association' | 'campaign'
  count?: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Cache simple pour les suggestions
const suggestionsCache = new Map<string, { data: AutocompleteResponse; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export class SearchService {
  // Recherche fédérée (associations + campagnes)
  static async federatedSearch(params: FederatedSearchParams): Promise<FederatedSearchResponse> {
    const startTime = Date.now()
    
    try {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v))
          } else {
            searchParams.set(key, value.toString())
          }
        }
      })

      const response = await fetch(
        `${API_BASE_URL}/api/hub/search/federated?${searchParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const data = await response.json()
      const queryTime = Date.now() - startTime

      return {
        ...data,
        queryTime
      }
    } catch (error) {
      console.error('Erreur lors de la recherche fédérée:', error)
      
      // Fallback: rechercher uniquement les associations
      return await this.fallbackSearch(params, Date.now() - startTime)
    }
  }

  // Autocomplete avancée avec cache
  static async getAutocompleteSuggestions(
    query: string, 
    recentSearches: SearchHistoryItem[] = []
  ): Promise<AutocompleteResponse> {
    if (!query.trim()) {
      return {
        suggestions: [],
        recent: recentSearches.slice(0, 5)
      }
    }

    const cacheKey = query.toLowerCase().trim()
    const cached = suggestionsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        ...cached.data,
        recent: recentSearches.slice(0, 5)
      }
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hub/search/autocomplete?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const data = await response.json()
      const result = {
        suggestions: data.suggestions || [],
        recent: recentSearches.slice(0, 5)
      }

      // Mettre en cache
      suggestionsCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      return result
    } catch (error) {
      console.error('Erreur lors de l\'autocomplete:', error)
      
      // Fallback avec suggestions statiques
      return this.getFallbackSuggestions(query, recentSearches)
    }
  }

  // Recherche de secours (uniquement associations)
  private static async fallbackSearch(params: FederatedSearchParams, baseQueryTime: number): Promise<FederatedSearchResponse> {
    try {
      const associationParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'types') {
          associationParams.set(key, value.toString())
        }
      })

      const response = await fetch(
        `${API_BASE_URL}/api/hub/associations/search?${associationParams}`
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche de secours')
      }

      const data = await response.json()
      
      const results: SearchResult[] = (data.associations || []).map((assoc: Association) => ({
        type: 'association' as const,
        id: assoc.id,
        title: assoc.name,
        description: assoc.description,
        category: assoc.category,
        location: assoc.location,
        verified: assoc.isVerified,
        data: assoc
      }))

      return {
        results,
        total: results.length,
        breakdown: {
          associations: results.length,
          campaigns: 0
        },
        suggestions: [],
        queryTime: Date.now() - baseQueryTime
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de secours:', error)
      return {
        results: [],
        total: 0,
        breakdown: { associations: 0, campaigns: 0 },
        suggestions: [],
        queryTime: Date.now() - baseQueryTime
      }
    }
  }

  // Suggestions de secours statiques
  private static getFallbackSuggestions(
    query: string, 
    recentSearches: SearchHistoryItem[]
  ): AutocompleteResponse {
    const staticSuggestions = [
      'Association caritative',
      'Aide aux personnes âgées',
      'Protection de l\'environnement',
      'Éducation des enfants',
      'Insertion professionnelle',
      'Aide alimentaire',
      'Santé mentale',
      'Culture et patrimoine',
      'Campagne urgente',
      'Collecte de fonds'
    ]

    const filtered = staticSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6)
      .map(text => ({
        text,
        type: 'association' as const,
        count: Math.floor(Math.random() * 20) + 1
      }))

    return {
      suggestions: filtered,
      recent: recentSearches.slice(0, 5)
    }
  }

  // Nettoyer le cache
  static clearCache() {
    suggestionsCache.clear()
  }
}
