// Type pour les associations avec toutes les données retournées par l'API
export interface AssociationFromAPI {
  id: string
  tenantId: string
  name: string
  description: string
  logo: string | null
  logoUrl: string | null
  coverImage: string | null
  category: string
  location: string
  city: string | null
  country: string | null
  email: string | null
  phone: string | null
  siteUrl: string | null
  isPublic: boolean
  isVerified: boolean
  activeCampaigns: number
  totalCampaigns: number
  totalRaised: number
  donationsCount: number
  createdAt: string
  updatedAt: string
  tenant?: {
    id: string
    slug: string
    name: string
  }
  campaigns?: Campaign[]
}

// Type pour les campagnes dans les associations
export interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised?: number
  donorCount?: number
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// Alias pour compatibilité
export type AssociationWithCampaigns = AssociationFromAPI
