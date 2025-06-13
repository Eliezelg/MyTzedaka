import { ApiClient } from '@/lib/api-client'

export interface CreateAssociationRequest {
  name: string
  description?: string
  email: string
  phone?: string
  website?: string
  address?: string
  logoUrl?: string
  [key: string]: unknown // Signature d'index pour compatibilité avec Record<string, unknown>
}

export interface Association {
  id: string
  name: string
  description?: string
  email: string
  phone?: string
  website?: string
  address?: string
  logoUrl?: string
  status: string
  createdAt: string
  updatedAt: string
  tenant?: {
    id: string
    slug: string
    name: string
  }
}

export interface UserAssociation {
  association: Association
  tenant: {
    id: string
    slug: string
    name: string
  }
  role: string
  isActive: boolean
  joinedAt: string
}

class AssociationsService {
  private apiClient = new ApiClient()

  async createAssociation(data: CreateAssociationRequest): Promise<Association> {
    const response = await this.apiClient.post<Association>('/hub/associations', data)
    return response.data
  }

  async getAssociation(id: string): Promise<Association> {
    const response = await this.apiClient.get<Association>(`/hub/associations/${id}`)
    return response.data
  }

  async getMyAssociations(): Promise<UserAssociation[]> {
    console.log(' AssociationsService.getMyAssociations - Appel en cours...')
    const response = await this.apiClient.get<UserAssociation[]>('/hub/my-associations')
    console.log(' Réponse brute reçue:', response)
    
    // Le backend retourne directement les données, pas dans une structure ApiResponse
    // Si response est déjà un tableau, on le retourne directement
    if (Array.isArray(response)) {
      console.log(' Données directes (tableau):', response)
      return response
    }
    
    // Sinon, essayer response.data
    if (response && response.data) {
      console.log(' Données via response.data:', response.data)
      return response.data
    }
    
    console.log(' Structure de réponse inattendue, retour tableau vide')
    return []
  }

  async getAllAssociations(): Promise<Association[]> {
    const response = await this.apiClient.get<Association[]>('/hub/associations')
    return response.data
  }
}

export const associationsService = new AssociationsService()
