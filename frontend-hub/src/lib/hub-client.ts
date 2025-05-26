/**
 * Hub API Client - Client spécialisé pour les nouvelles APIs Backend
 * Utilise les endpoints /api/hub/* du backend NestJS
 */

import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api-client'

// Types pour les réponses API Hub
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Types Association avec détails complets
export interface Association {
  id: string
  tenantId: string
  name: string
  description: string
  category: string
  location: string
  logo?: string
  coverImage?: string
  isPublic: boolean
  isVerified: boolean
  hasSite: boolean
  siteUrl?: string
  phone?: string
  email?: string
  address?: string
  totalRaised: number
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  donationsCount: number
  avgDonation: number
  createdAt: string
  updatedAt: string
}

// Types Campagne avec détails complets
export interface Campaign {
  id: string
  tenantId: string
  userId: string
  associationListingId?: string
  title: string
  description: string
  shortDescription?: string
  goal: number
  raised: number
  currency: string
  category?: string
  coverImage?: string
  images?: string[]
  videoUrl?: string
  startDate: string
  endDate: string
  status: string
  isActive: boolean
  isFeatured: boolean
  isUrgent: boolean
  isPublic: boolean
  isVerified: boolean
  donationsCount: number
  donorsCount: number
  avgDonation: number
  progressPercentage: number
  daysLeft: number
  createdAt: string
  updatedAt: string
  
  // Relations
  tenant?: {
    id: string
    domain: string
    name: string
  }
  associationListing?: Association
  user?: {
    id: string
    email: string
    name?: string
  }
  _count?: {
    donations: number
  }
}

// Filtres pour les associations
export interface AssociationsFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  location?: string
  verified?: boolean
  sortBy?: 'name' | 'createdAt' | 'totalRaised' | 'totalCampaigns'
  sortOrder?: 'asc' | 'desc'
}

// Filtres pour les campagnes
export interface CampaignsFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  associationId?: string
  status?: string
  featured?: boolean
  urgent?: boolean
  sortBy?: 'createdAt' | 'goal' | 'raised' | 'endDate'
  sortOrder?: 'asc' | 'desc'
}

// Réponse de recherche unifiée
export interface SearchResponse {
  associations: PaginatedResponse<Association>
  campaigns: PaginatedResponse<Campaign>
  totalResults: number
}

// Client Hub API
class HubApiClient {
  /**
   * Récupère la liste des associations avec pagination et filtres
   */
  async getAssociations(filters: AssociationsFilters = {}): Promise<PaginatedResponse<Association>> {
    const response = await apiClient.get<PaginatedResponse<Association>>('/hub/associations', {
      page: filters.page || 1,
      limit: Math.min(filters.limit || 12, 50),
      search: filters.search,
      category: filters.category,
      location: filters.location,
      verified: filters.verified,
      sortBy: filters.sortBy || 'name',
      sortOrder: filters.sortOrder || 'asc'
    })

    return response.data
  }

  /**
   * Récupère une association par son ID
   */
  async getAssociationById(id: string): Promise<Association> {
    const response = await apiClient.get<Association>(`/hub/associations/${id}`)
    
    if (!response.success || !response.data) {
      throw new Error(`Association with ID ${id} not found`)
    }

    return response.data
  }

  /**
   * Récupère la liste des campagnes avec pagination et filtres
   */
  async getCampaigns(filters: CampaignsFilters = {}): Promise<PaginatedResponse<Campaign>> {
    const response = await apiClient.get<PaginatedResponse<Campaign>>('/hub/campaigns', {
      page: filters.page || 1,
      limit: Math.min(filters.limit || 12, 50),
      search: filters.search,
      category: filters.category,
      associationId: filters.associationId,
      status: filters.status,
      featured: filters.featured,
      urgent: filters.urgent,
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc'
    })

    return response.data
  }

  /**
   * Récupère une campagne par son ID
   */
  async getCampaignById(id: string): Promise<Campaign> {
    const response = await apiClient.get<Campaign>(`/hub/campaigns/${id}`)
    
    if (!response.success || !response.data) {
      throw new Error(`Campaign with ID ${id} not found`)
    }

    return response.data
  }

  /**
   * Recherche unifiée dans associations et campagnes
   */
  async search(query: string, filters: {
    page?: number
    limit?: number
    category?: string
    type?: 'all' | 'associations' | 'campaigns'
  } = {}): Promise<SearchResponse> {
    const params = {
      q: query,
      page: filters.page || 1,
      limit: Math.min(filters.limit || 20, 50),
      category: filters.category,
      type: filters.type || 'all'
    }

    // Si recherche spécifique
    if (filters.type === 'associations') {
      const associations = await this.getAssociations({
        ...params,
        search: query
      })
      return {
        associations,
        campaigns: { data: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        totalResults: associations.pagination.total
      }
    }

    if (filters.type === 'campaigns') {
      const campaigns = await this.getCampaigns({
        ...params,
        search: query
      })
      return {
        associations: { data: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        campaigns,
        totalResults: campaigns.pagination.total
      }
    }

    // Recherche dans les deux
    const [associations, campaigns] = await Promise.all([
      this.getAssociations({ ...params, search: query, limit: Math.floor(params.limit / 2) }),
      this.getCampaigns({ ...params, search: query, limit: Math.floor(params.limit / 2) })
    ])

    return {
      associations,
      campaigns,
      totalResults: associations.pagination.total + campaigns.pagination.total
    }
  }

  /**
   * Récupère les statistiques générales du hub
   */
  async getHubStats(): Promise<{
    totalAssociations: number
    totalCampaigns: number
    totalRaised: number
    activeCampaigns: number
  }> {
    const response = await apiClient.get<{
      totalAssociations: number
      totalCampaigns: number
      totalRaised: number
      activeCampaigns: number
    }>('/hub/stats')

    return response.data
  }

  /**
   * Récupère les associations en vedette
   */
  async getFeaturedAssociations(limit = 6): Promise<Association[]> {
    const response = await this.getAssociations({
      limit,
      verified: true,
      sortBy: 'totalRaised',
      sortOrder: 'desc'
    })

    return response.data
  }

  /**
   * Récupère les campagnes en vedette ou urgentes
   */
  async getFeaturedCampaigns(limit = 6): Promise<Campaign[]> {
    const response = await this.getCampaigns({
      limit,
      featured: true,
      status: 'ACTIVE',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    return response.data
  }

  /**
   * Récupère les campagnes urgentes
   */
  async getUrgentCampaigns(limit = 6): Promise<Campaign[]> {
    const response = await this.getCampaigns({
      limit,
      urgent: true,
      status: 'ACTIVE',
      sortBy: 'endDate',
      sortOrder: 'asc'
    })

    return response.data
  }
}

// Instance exportée
export const hubApiClient = new HubApiClient()
