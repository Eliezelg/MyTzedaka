/**
 * Utilitaires pour transformer les types Listing en types complets
 * pour l'affichage dans les composants
 */

import { 
  AssociationListing, 
  CampaignListing, 
  Association 
} from '@/lib/types/backend'

import { Campaign } from '@/types/hub'

/**
 * Transforme un AssociationListing en Association complète
 * pour la compatibilité avec les composants
 */
export function transformAssociationListing(listing: AssociationListing): Association {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description || '',
    logoUrl: listing.logoUrl,
    coverImage: listing.logoUrl, // Utilise logoUrl comme coverImage
    category: listing.category,
    location: `${listing.city || ''}, ${listing.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Non spécifié',
    city: listing.city,
    country: listing.country,
    isVerified: listing.isVerified,
    isPublic: listing.isPublic,
    hasSite: listing.hasSite,
    siteUrl: listing.siteUrl,
    tenantId: 'default', // Valeur par défaut
    activeCampaigns: listing.activeCampaignsCount,
    totalCampaigns: listing.activeCampaignsCount, // Approximation
    donationsCount: listing.donationsCount,
    totalRaised: listing.totalRaised,
    createdAt: listing.createdAt,
    updatedAt: listing.createdAt // Approximation
  }
}

/**
 * Transforme un CampaignListing en Campaign complet
 * pour la compatibilité avec les composants
 */
export function transformCampaignListing(listing: CampaignListing): Campaign & { raised?: number; donorCount?: number } {
  return {
    id: listing.id,
    tenantId: listing.tenantId,
    userId: 'default', // Valeur par défaut
    title: listing.title,
    description: listing.description || '',
    goal: listing.goal,
    currency: listing.currency,
    startDate: listing.startDate,
    endDate: listing.endDate,
    status: listing.status as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED',
    isActive: listing.status === 'ACTIVE',
    createdAt: listing.startDate, // Utilise startDate
    updatedAt: listing.startDate, // Approximation
    raised: listing.currentAmount,
    donorCount: listing.donationsCount
  }
}

/**
 * Transforme un tableau d'AssociationListing en tableau d'Association
 */
export function transformAssociationListings(listings: AssociationListing[]): Association[] {
  return listings.map(transformAssociationListing)
}

/**
 * Transforme un tableau de CampaignListing en tableau de Campaign
 */
export function transformCampaignListings(listings: CampaignListing[]): (Campaign & { raised?: number; donorCount?: number })[] {
  return listings.map(transformCampaignListing)
}
