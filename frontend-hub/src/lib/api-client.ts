import { QueryClient } from '@tanstack/react-query'

// Configuration API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  statusCode: number
  error: string
  details?: unknown
}

// Client API principal
export class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Méthode pour ajouter l'authentification
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`,
    }
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.message || `HTTP Error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // Méthodes HTTP
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Instance globale du client API
export const apiClient = new ApiClient()

// Configuration Query Client pour TanStack Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// Utilitaires pour les clés de cache
export const queryKeys = {
  // Associations
  associations: ['associations'] as const,
  associationsList: (filters?: Record<string, unknown>) => [...queryKeys.associations, 'list', filters] as const,
  associationDetail: (id: string) => [...queryKeys.associations, 'detail', id] as const,
  associationCampaigns: (id: string) => [...queryKeys.associations, id, 'campaigns'] as const,
  
  // Campagnes
  campaigns: ['campaigns'] as const,
  campaignsList: (filters?: Record<string, unknown>) => [...queryKeys.campaigns, 'list', filters] as const,
  campaignDetail: (id: string) => [...queryKeys.campaigns, 'detail', id] as const,
  
  // Recherche
  search: ['search'] as const,
  searchResults: (query: string, filters?: Record<string, unknown>) => [...queryKeys.search, 'results', query, filters] as const,
  searchSuggestions: (query: string) => [...queryKeys.search, 'suggestions', query] as const,
  
  // Hub
  hub: ['hub'] as const,
  hubStats: () => [...queryKeys.hub, 'stats'] as const,
  hubFeatured: () => [...queryKeys.hub, 'featured'] as const,
} as const

export default apiClient
