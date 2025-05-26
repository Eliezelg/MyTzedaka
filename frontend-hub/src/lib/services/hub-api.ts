/**
 * Hub API Service - Service spécialisé pour les données du Hub Central
 * Utilise l'ApiClient existant avec retry et error handling
 */

import { ApiClient } from '@/lib/api-client'
import { 
  AssociationListing, 
  CampaignListing, 
  HubStats,
  AssociationsFilters,
  CampaignsFilters,
  SearchFilters,
  PaginatedResponse,
  SearchResponse,
  AssociationMetrics,
  CampaignMetrics
} from '@/lib/types/backend'

// Classes d'erreurs spécialisées Hub
export class HubApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'HubApiError'
  }
}

export class DataValidationError extends HubApiError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'DataValidationError'
  }
}

export class DataNotFoundError extends HubApiError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 404, 'NOT_FOUND')
    this.name = 'DataNotFoundError'
  }
}

// Utilitaires de gestion d'erreur et retry
class HubApiService {
  private readonly apiClient: ApiClient
  private readonly maxRetries = 3
  private readonly retryDelay = 1000

  constructor() {
    this.apiClient = new ApiClient()
  }

  // Méthode utilitaire pour delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Méthode générique avec retry et gestion d'erreur
  private async withRetry<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: any) => boolean = () => true
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        const isLastAttempt = attempt === this.maxRetries
        const canRetry = shouldRetry(error)
        
        if (!isLastAttempt && canRetry) {
          console.warn(`Hub API retry ${attempt}/${this.maxRetries}:`, lastError.message)
          await this.delay(this.retryDelay * attempt) // Exponential backoff
          continue
        }
        
        break
      }
    }

    throw lastError
  }

  /**
   * Récupère la liste des associations avec filtres
   */
  async getAssociations(filters: AssociationsFilters = {}): Promise<PaginatedResponse<AssociationListing>> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Convertir les filtres en paramètres de requête
        const queryParams: Record<string, string | number | boolean | undefined> = {}
        
        if (filters.category) queryParams.category = filters.category
        if (filters.location) queryParams.location = filters.location
        if (filters.isVerified !== undefined) queryParams.verified = filters.isVerified
        if (filters.search) queryParams.search = filters.search
        if (filters.sortBy) queryParams.sortBy = filters.sortBy
        if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder
        if (filters.page) queryParams.page = filters.page
        if (filters.limit) queryParams.limit = filters.limit

        const result = await this.apiClient.get<PaginatedResponse<AssociationListing>>(
          '/hub/associations',
          queryParams
        )

        if (!result.success) {
          throw new HubApiError(
            result.message || 'Erreur lors de la récupération des associations',
            500
          )
        }

        // Validation des données
        if (!this.isValidAssociationsResponse(result.data)) {
          console.warn('Réponse associations invalide:', result.data)
          // Retourner une réponse vide plutôt qu'une erreur
          return {
            data: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0
            }
          }
        }

        return result.data

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        if (attempt === this.maxRetries) {
          break
        }

        await this.delay(this.retryDelay * attempt)
      }
    }

    throw lastError
  }

  /**
   * Récupère une association par ID
   */
  async getAssociation(id: string): Promise<AssociationListing> {
    if (!id) {
      throw new HubApiError('Association ID is required', 400)
    }

    return this.withRetry(async () => {
      try {
        const response = await this.apiClient.get<AssociationListing>(`/hub/associations/${id}`)
        
        if (!response.success || !response.data) {
          throw new DataNotFoundError('Association', id)
        }

        return this.validateAssociation(response.data)
      } catch (error) {
        if (error instanceof HubApiError) {
          throw error
        }
        throw new HubApiError('Failed to fetch association', 500)
      }
    })
  }

  /**
   * Récupère les campagnes d'une association spécifique
   */
  async getAssociationCampaigns(
    associationId: string, 
    filters: Omit<CampaignsFilters, 'associationId'> = {}
  ): Promise<PaginatedResponse<CampaignListing>> {
    if (!associationId) {
      throw new HubApiError('Association ID is required', 400)
    }

    return this.withRetry(async () => {
      const response = await this.apiClient.get<PaginatedResponse<CampaignListing>>(
        `/hub/associations/${associationId}/campaigns`, 
        filters
      )
      
      if (!response.success || !response.data) {
        throw new HubApiError('Failed to fetch association campaigns', 500)
      }

      const validatedData = response.data.data.map((item: any) => this.validateCampaign(item))
      
      return {
        data: validatedData,
        pagination: response.data.pagination || {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total: validatedData.length,
          totalPages: 1
        }
      }
    })
  }

  /**
   * Récupère la liste des campagnes avec filtres
   */
  async getCampaigns(filters: CampaignsFilters = {}): Promise<PaginatedResponse<CampaignListing>> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Convertir les filtres en paramètres de requête
        const queryParams: Record<string, string | number | boolean | undefined> = {}
        
        if (filters.associationId) queryParams.associationId = filters.associationId
        if (filters.status) queryParams.status = filters.status
        if (filters.category) queryParams.category = filters.category
        if (filters.targetAmountMin) queryParams.targetAmountMin = filters.targetAmountMin
        if (filters.targetAmountMax) queryParams.targetAmountMax = filters.targetAmountMax
        if (filters.progressMin) queryParams.progressMin = filters.progressMin
        if (filters.progressMax) queryParams.progressMax = filters.progressMax
        if (filters.location) queryParams.location = filters.location
        if (filters.search) queryParams.search = filters.search
        if (filters.sortBy) queryParams.sortBy = filters.sortBy
        if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder
        if (filters.page) queryParams.page = filters.page
        if (filters.limit) queryParams.limit = filters.limit

        const result = await this.apiClient.get<PaginatedResponse<CampaignListing>>(
          '/hub/campaigns',
          queryParams
        )

        if (!result.success) {
          throw new HubApiError(
            result.message || 'Erreur lors de la récupération des campagnes',
            500
          )
        }

        // Validation des données
        if (!this.isValidCampaignsResponse(result.data)) {
          console.warn('Réponse campagnes invalide:', result.data)
          // Retourner une réponse vide plutôt qu'une erreur
          return {
            data: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0
            }
          }
        }

        return result.data

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        if (attempt === this.maxRetries) {
          break
        }

        await this.delay(this.retryDelay * attempt)
      }
    }

    throw lastError
  }

  /**
   * Récupère une campagne par ID
   */
  async getCampaign(id: string): Promise<CampaignListing> {
    if (!id) {
      throw new HubApiError('Campaign ID is required', 400)
    }

    return this.withRetry(async () => {
      try {
        const response = await this.apiClient.get<CampaignListing>(`/hub/campaigns/${id}`)
        
        if (!response.success || !response.data) {
          throw new DataNotFoundError('Campaign', id)
        }

        return this.validateCampaign(response.data)
      } catch (error) {
        if (error instanceof HubApiError) {
          throw error
        }
        throw new HubApiError('Failed to fetch campaign', 500)
      }
    })
  }

  /**
   * Recherche globale dans le hub
   */
  async search(filters: SearchFilters): Promise<SearchResponse> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Convertir les filtres en paramètres de requête
        const queryParams: Record<string, string | number | boolean | undefined> = {}
        
        if (filters.query) queryParams.query = filters.query
        if (filters.type) queryParams.type = filters.type
        if (filters.category) queryParams.category = filters.category
        if (filters.location) queryParams.location = filters.location
        if (filters.page) queryParams.page = filters.page
        if (filters.limit) queryParams.limit = filters.limit

        const result = await this.apiClient.get<SearchResponse>(
          '/hub/search',
          queryParams
        )

        if (!result.success) {
          throw new HubApiError(
            result.message || 'Erreur lors de la recherche',
            500
          )
        }

        // Validation de base
        if (!result.data || typeof result.data !== 'object') {
          return {
            associations: [],
            campaigns: [],
            total: 0
          }
        }

        return result.data

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        if (attempt === this.maxRetries) {
          break
        }

        await this.delay(this.retryDelay * attempt)
      }
    }

    throw lastError
  }

  /**
   * Récupère les statistiques générales du hub
   */
  async getHubStats(): Promise<HubStats> {
    return this.withRetry(async () => {
      try {
        const response = await this.apiClient.get<HubStats>('/hub/stats')
        
        if (!response.success || !response.data) {
          throw new HubApiError('Impossible de récupérer les statistiques du hub', 500)
        }

        return response.data
      } catch (error) {
        if (error instanceof HubApiError) {
          throw error
        }
        throw new HubApiError(`Erreur lors de la récupération des statistiques: ${error}`, 500)
      }
    })
  }

  /**
   * Récupère la liste des associations avec filtres optionnels
   */

  /**
   * Récupère les métriques détaillées d'une association
   */
  async getAssociationMetrics(associationId: string): Promise<AssociationMetrics> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.apiClient.get<AssociationMetrics>(
          `/hub/associations/${associationId}/metrics`
        )

        if (!result.success) {
          throw new HubApiError(
            result.message || 'Erreur lors de la récupération des métriques',
            500
          )
        }

        // Retourner des métriques par défaut si vides
        return result.data || {
          totalDonations: 0,
          totalAmount: 0,
          averageDonation: 0,
          donorsCount: 0,
          monthlyGrowth: 0,
          topDonors: []
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        if (attempt === this.maxRetries) {
          break
        }

        await this.delay(this.retryDelay * attempt)
      }
    }

    throw lastError
  }

  /**
   * Récupère les métriques détaillées d'une campagne
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    let lastError: Error = new Error('Unknown error')

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.apiClient.get<CampaignMetrics>(
          `/hub/campaigns/${campaignId}/metrics`
        )

        if (!result.success) {
          throw new HubApiError(
            result.message || 'Erreur lors de la récupération des métriques',
            500
          )
        }

        // Retourner des métriques par défaut si vides
        return result.data || {
          currentAmount: 0,
          donationsCount: 0,
          progressPercentage: 0,
          averageDonation: 0,
          recentDonations: []
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue')
        
        if (attempt === this.maxRetries) {
          break
        }

        await this.delay(this.retryDelay * attempt)
      }
    }

    throw lastError
  }

  /**
   * Validation de la réponse des associations
   */
  private isValidAssociationsResponse(data: any): data is PaginatedResponse<AssociationListing> {
    return data &&
           typeof data === 'object' &&
           Array.isArray(data.data) &&
           typeof data.pagination === 'object' &&
           typeof data.pagination.page === 'number' &&
           typeof data.pagination.limit === 'number' &&
           typeof data.pagination.total === 'number' &&
           typeof data.pagination.totalPages === 'number'
  }

  /**
   * Validation de la réponse des campagnes
   */
  private isValidCampaignsResponse(data: any): data is PaginatedResponse<CampaignListing> {
    return data &&
           typeof data === 'object' &&
           Array.isArray(data.data) &&
           typeof data.pagination === 'object' &&
           typeof data.pagination.page === 'number' &&
           typeof data.pagination.limit === 'number' &&
           typeof data.pagination.total === 'number' &&
           typeof data.pagination.totalPages === 'number'
  }

  /**
   * Validation des données d'association
   */
  private validateAssociation(data: any): AssociationListing {
    if (!data || typeof data !== 'object') {
      throw new DataValidationError('Invalid association data')
    }

    // Validation basique des champs requis
    if (!data.id || typeof data.id !== 'string') {
      throw new DataValidationError('Association ID is required', 'id')
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new DataValidationError('Association name is required', 'name')
    }

    return data as AssociationListing
  }

  /**
   * Validation des données de campagne
   */
  private validateCampaign(data: any): CampaignListing {
    if (!data || typeof data !== 'object') {
      throw new DataValidationError('Invalid campaign data')
    }

    // Validation basique des champs requis
    if (!data.id || typeof data.id !== 'string') {
      throw new DataValidationError('Campaign ID is required', 'id')
    }

    if (!data.title || typeof data.title !== 'string') {
      throw new DataValidationError('Campaign title is required', 'title')
    }

    return data as CampaignListing
  }
}

// Export d'une instance unique
export const hubApiService = new HubApiService()
