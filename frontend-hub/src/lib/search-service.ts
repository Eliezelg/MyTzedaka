/**
 * Service de recherche pour l'API Hub Central
 * Gère la recherche fédérée associations + campagnes
 */

import { Association, Campaign } from '@/types/hub'

export interface AutocompleteResponse {
  suggestions: {
    text: string
    type: 'association' | 'campaign' | 'general'
    resultCount?: number
  }[]
  recent: {
    text: string
    type: 'association' | 'campaign' | 'general'
    resultCount?: number
  }[]
}

export interface AutocompleteData {
  suggestions: {
    id: string
    text: string
    type: 'association' | 'campaign' | 'category' | 'location'
    metadata?: {
      category?: string
      location?: string
      verified?: boolean
    }
  }[]
  recent: {
    id: string
    text: string
    timestamp: number
  }[]
}

export interface SearchResult {
  associations: Association[]
  campaigns: Campaign[]
  total: number
}

export class SearchService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  private static cache = new Map<string, { data: unknown, timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Recherche globale dans associations et campagnes
   */
  static async search(
    query: string,
    filters: Record<string, unknown> = {},
    options: {
      page?: number
      limit?: number
      sort?: string
    } = {}
  ): Promise<SearchResult> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}:${JSON.stringify(options)}`
    
    // Vérifier le cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as SearchResult
    }

    try {
      const searchParams = new URLSearchParams({
        q: query,
        page: String(options.page || 1),
        limit: String(options.limit || 20),
        sort: options.sort || 'relevance'
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`${this.baseUrl}/api/search?${searchParams}`)
      const data = await response.json()
      
      // Mettre en cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data as SearchResult
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return { associations: [], campaigns: [], total: 0 }
    }
  }

  /**
   * Suggestions d'autocomplétion
   */
  static async getAutocompleteSuggestions(
    query: string, 
    recentSearches: { text: string; type: string }[] = []
  ): Promise<AutocompleteResponse> {
    if (!query.trim()) {
      return {
        suggestions: [],
        recent: recentSearches.map(item => ({
          text: item.text,
          type: item.type as 'association' | 'campaign' | 'general',
          resultCount: 0
        })).slice(0, 5)
      }
    }

    const cacheKey = `autocomplete:${query}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      const cachedData = cached.data as AutocompleteResponse
      return { 
        ...cachedData, 
        recent: recentSearches.map(item => ({
          text: item.text,
          type: item.type as 'association' | 'campaign' | 'general',
          resultCount: 0
        })).slice(0, 5)
      }
    }

    try {
      const params = new URLSearchParams({ q: query, limit: '8' })
      const response = await fetch(`${this.baseUrl}/api/hub/autocomplete?${params}`)
      
      if (!response.ok) {
        throw new Error(`Erreur autocomplétion: ${response.status}`)
      }

      const suggestions = await response.json()
      
      const result: AutocompleteResponse = {
        suggestions: suggestions.slice(0, 6),
        recent: recentSearches.map(item => ({
          text: item.text,
          type: item.type as 'association' | 'campaign' | 'general',
          resultCount: 0
        })).slice(0, 5)
      }
      
      // Mettre en cache sans les recherches récentes
      this.cache.set(cacheKey, { 
        data: { suggestions: result.suggestions, recent: [] }, 
        timestamp: Date.now() 
      })
      
      return result
    } catch (error) {
      console.error('Erreur lors de l\'autocomplétion:', error)
      return {
        suggestions: [],
        recent: recentSearches.map(item => ({
          text: item.text,
          type: item.type as 'association' | 'campaign' | 'general',
          resultCount: 0
        })).slice(0, 5)
      }
    }
  }

  /**
   * Recherche par catégorie
   */
  static async searchByCategory(category: string): Promise<SearchResult> {
    return this.search('', { category })
  }

  /**
   * Recherche géographique
   */
  static async searchByLocation(location: string): Promise<SearchResult> {
    return this.search('', { location })
  }

  /**
   * Campagnes populaires
   */
  static async getPopularCampaigns(limit = 6) {
    const cacheKey = `popular:${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/hub/campaigns/popular?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Erreur campagnes populaires: ${response.status}`)
      }

      const data = await response.json()
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes populaires:', error)
      return []
    }
  }

  /**
   * Effacer le cache
   */
  static clearCache() {
    this.cache.clear()
  }

  /**
   * Nettoyer le cache expiré
   */
  static cleanExpiredCache() {
    const now = Date.now()
    for (const [key, { timestamp }] of this.cache.entries()) {
      if (now - timestamp > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }
}

// Nettoyer le cache automatiquement toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    SearchService.cleanExpiredCache()
  }, 10 * 60 * 1000)
}

/**
 * Fonction pour rechercher du contenu similaire
 * Utilisée par le composant RelatedContent
 */
export async function searchRelatedContent(
  currentId: string,
  currentType: 'association' | 'campaign',
  options?: {
    variant?: 'cards' | 'list' | 'carousel'
    maxItems?: number
    showType?: 'all' | 'association' | 'campaign'
    algorithm?: 'similar' | 'popular' | 'recent' | 'related'
  }
) {
  try {
    const searchResult = await SearchService.search('', {
      excludeId: currentId,
      type: options?.showType || 'all',
      algorithm: options?.algorithm || 'similar'
    }, {
      limit: options?.maxItems || 6
    })

    // Combiner les résultats et les formater
    const allResults = [
      ...searchResult.associations.map(a => ({ ...a, type: 'association' as const })),
      ...searchResult.campaigns.map(c => ({ ...c, type: 'campaign' as const }))
    ]

    return allResults.slice(0, options?.maxItems || 6)
  } catch (error) {
    console.error('Erreur lors de la recherche de contenu similaire:', error)
    return []
  }
}
