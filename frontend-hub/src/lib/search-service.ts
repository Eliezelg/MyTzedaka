/**
 * Service de recherche pour l'API Hub Central
 * Gère la recherche fédérée associations + campagnes
 */

export interface AutocompleteResponse {
  suggestions: {
    text: string
    type: 'association' | 'campaign'
    count?: number
  }[]
  recent: {
    text: string
    type: 'association' | 'campaign' | 'general'
    resultCount?: number
  }[]
}

export interface SearchResult {
  associations: any[]
  campaigns: any[]
  total: number
}

export class SearchService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  private static cache = new Map<string, { data: any, timestamp: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Recherche globale dans associations et campagnes
   */
  static async search(
    query: string,
    filters: Record<string, any> = {},
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
      return cached.data
    }

    try {
      const params = new URLSearchParams({
        q: query,
        page: String(options.page || 1),
        limit: String(options.limit || 12),
        sort: options.sort || 'relevance',
        ...filters
      })

      const response = await fetch(`${this.baseUrl}/api/hub/search?${params}`)
      
      if (!response.ok) {
        throw new Error(`Erreur recherche: ${response.status}`)
      }

      const data = await response.json()
      
      // Mettre en cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
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
    recentSearches: any[] = []
  ): Promise<AutocompleteResponse> {
    if (!query.trim()) {
      return {
        suggestions: [],
        recent: recentSearches.slice(0, 5)
      }
    }

    const cacheKey = `autocomplete:${query}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { ...cached.data, recent: recentSearches.slice(0, 5) }
    }

    try {
      const params = new URLSearchParams({ q: query, limit: '8' })
      const response = await fetch(`${this.baseUrl}/api/hub/autocomplete?${params}`)
      
      if (!response.ok) {
        throw new Error(`Erreur autocomplétion: ${response.status}`)
      }

      const suggestions = await response.json()
      
      const result = {
        suggestions: suggestions.slice(0, 6),
        recent: recentSearches.slice(0, 5)
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
        recent: recentSearches.slice(0, 5)
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
