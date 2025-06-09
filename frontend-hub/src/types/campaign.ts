/**
 * Type Campaign unifié basé sur le schéma Prisma
 * CETTE DÉFINITION FAIT AUTORITÉ - NE PAS CRÉER D'AUTRES DÉFINITIONS
 */

export interface Campaign {
  id: string
  tenantId: string
  userId: string
  associationListingId?: string

  // Informations de la campagne
  title: string
  description: string
  shortDescription?: string
  goal: number // Decimal converti en number
  raised: number // Decimal converti en number
  currency: string

  // Images et média
  coverImage?: string
  images: string[]
  videoUrl?: string

  // Statistiques
  donationsCount: number
  donorsCount: number
  avgDonation: number

  // Dates
  startDate: string // ISO string
  endDate?: string // ISO string

  // Statut et visibilité
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  isActive: boolean
  isUrgent: boolean
  isFeatured: boolean
  isPublic: boolean
  isVerified: boolean

  // Catégorisation
  category?: string
  tags: string[]

  // Métadonnées
  createdAt: string // ISO string
  updatedAt: string // ISO string

  // Relations incluses (optionnelles)
  tenant?: {
    id: string
    name: string
    slug: string
    domain?: string
  }
  
  associationListing?: {
    id: string
    name: string
    description?: string
    logoUrl?: string
    location?: string
    isVerified: boolean
    totalRaised: number
    donationsCount: number
  }

  user?: {
    firstName: string
    lastName: string
  }

  donations?: Array<{
    id: string
    amount: number
    currency: string
    createdAt: string
  }>

  _count?: {
    donations: number
  }

  // Propriétés calculées (ajoutées par le backend)
  progressPercentage?: number
  daysLeft?: number
  associationName?: string
  associationLogo?: string
  associationLocation?: string
  isVerifiedAssociation?: boolean
  recentDonations?: Array<{
    id: string
    amount: number
    currency: string
    createdAt: string
  }>
}

// Interface pour les réponses paginées
export interface CampaignsPaginatedResponse {
  campaigns: Campaign[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Interface pour les filtres
export interface CampaignsFilters extends Record<string, string | number | boolean | undefined> {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
  isFeatured?: boolean
  isUrgent?: boolean
}
