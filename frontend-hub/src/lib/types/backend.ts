/**
 * Types synchronisés avec le schéma Prisma backend
 * Génération automatique basée sur schema.prisma
 */

// Enums du backend
export enum UserRole {
  DONATOR = 'DONATOR',
  ASSOCIATION_ADMIN = 'ASSOCIATION_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN'
}

export enum DonationSource {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  IMPORT = 'IMPORT'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum EventType {
  RELIGIOUS = 'RELIGIOUS',
  CULTURAL = 'CULTURAL',
  EDUCATIONAL = 'EDUCATIONAL',
  SOCIAL = 'SOCIAL',
  FUNDRAISING = 'FUNDRAISING'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Modèles Prisma
export interface Tenant {
  id: string
  name: string
  subdomain: string
  logoUrl?: string
  description?: string
  category: string
  city?: string
  country?: string
  email: string
  phone?: string
  website?: string
  isActive: boolean
  isPublic: boolean
  isVerified: boolean
  hasSite: boolean
  siteUrl?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  tenantId: string
  email: string
  cognitoId: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  permissions: unknown
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Donation {
  id: string
  tenantId: string
  userId: string
  source: DonationSource
  sourceUrl?: string
  amount: number
  currency: string
  isRecurring: boolean
  paymentMethod?: string
  platformFeePercentage: number
  platformFeeAmount: number
  netAmount: number
  donorEmail?: string
  donorFirstName?: string
  donorLastName?: string
  donorPhone?: string
  isAnonymous: boolean
  message?: string
  status: string
  paidAt?: string
  refundedAt?: string
  createdAt: string
  updatedAt: string
  campaignId?: string
}

export interface Campaign {
  id: string
  tenantId: string
  userId: string
  title: string
  description: string
  goal: number
  currency: string
  startDate: string
  endDate: string
  status: CampaignStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DonorProfile {
  id: string
  email: string
  cognitoId: string
  firstName: string
  lastName: string
  phone?: string
  totalDonations: number
  totalAmount: number
  favoriteAssociations: string[]
  preferredCurrency: string
  communicationPrefs: unknown
  createdAt: string
  updatedAt: string
  lastDonationAt?: string
}

// === TYPES PRINCIPAUX ===

// Interface pour l'entité Association complète
export interface Association {
  id: string
  name: string
  description: string
  logoUrl?: string
  coverImage?: string
  category: string
  location: string
  city?: string
  country?: string
  isVerified: boolean
  isPublic: boolean
  hasSite: boolean
  siteUrl?: string
  tenantId: string
  // Compteurs calculés
  activeCampaigns: number
  totalCampaigns: number
  donationsCount: number
  totalRaised: number
  // Métadonnées
  createdAt: string
  updatedAt: string
}

export interface AssociationListing {
  id: string
  name: string
  description?: string
  logoUrl?: string
  category: string
  city?: string
  country?: string
  isVerified: boolean
  isPublic: boolean
  hasSite: boolean
  siteUrl?: string
  // Statistiques calculées
  donationsCount: number
  totalRaised: number
  activeCampaignsCount: number
  createdAt: string
  // Tenant associé avec slug
  tenant?: {
    id: string
    slug: string
    name: string
  }
}

export interface CampaignListing {
  id: string
  tenantId: string
  title: string
  description: string
  goal: number
  currency: string
  startDate: string
  endDate: string
  status: CampaignStatus
  // Statistiques calculées
  currentAmount: number
  donationsCount: number
  progressPercentage: number
  // Association liée
  association: {
    id: string
    name: string
    logoUrl?: string
  }
}

// Statistiques générales du Hub
export interface HubStats {
  totalAssociations: number
  totalCampaigns: number
  totalDonations: number
  totalAmount: number
  activeCampaigns: number
  verifiedAssociations: number
  monthlyGrowth: number
}

export interface CampaignMetrics {
  currentAmount: number
  donationsCount: number
  progressPercentage: number
  averageDonation: number
  recentDonations: {
    id: string
    amount: number
    donorName?: string
    createdAt: string
  }[]
}

// === TYPES DE PAGINATION ===

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// === TYPES DE RECHERCHE ===

export interface SearchResponse {
  associations: AssociationListing[]
  campaigns: CampaignListing[]
  total: number
}

// === TYPES DE MÉTRIQUES ===

export interface AssociationMetrics {
  totalDonations: number
  totalAmount: number
  averageDonation: number
  donorsCount: number
  monthlyGrowth: number
  topDonors: Array<{
    name: string
    amount: number
    count: number
  }>
}

// === FILTRES ÉTENDUS ===

export interface AssociationsFilters {
  category?: string
  location?: string
  isVerified?: boolean
  search?: string
  sortBy?: 'name' | 'createdAt' | 'totalRaised' | 'campaignsCount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CampaignsFilters {
  associationId?: string
  status?: CampaignStatus
  category?: string
  targetAmountMin?: number
  targetAmountMax?: number
  progressMin?: number
  progressMax?: number
  location?: string
  search?: string
  sortBy?: 'createdAt' | 'endDate' | 'currentAmount' | 'targetAmount' | 'progressPercentage'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchFilters {
  query: string
  type?: 'associations' | 'campaigns' | 'both'
  category?: string
  location?: string
  page?: number
  limit?: number
}

// Types pour les API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
