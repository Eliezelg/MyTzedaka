export interface HubStats {
  totalAssociations: number
  verifiedAssociations: number
  totalCampaigns: number
  activeCampaigns: number
  totalDonations: number
  totalAmount: number
}

export interface Association {
  id: string
  tenantId: string
  name: string
  description: string
  logo?: string
  coverImage?: string
  category: string
  location: string
  isPublic: boolean
  isVerified: boolean
  hasSite?: boolean
  siteUrl?: string
  totalCampaigns: number
  activeCampaigns: number
  createdAt: string
  updatedAt: string
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
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  isActive: boolean
  createdAt: string
  updatedAt: string
  tenant?: {
    name: string
    slug: string
  }
  _count?: {
    donations: number
  }
}

export interface Donation {
  id: string
  amount: number
  currency: string
  message?: string
  isAnonymous: boolean
  createdAt: string
  campaign?: Campaign
  donor?: {
    name: string
    email: string
  }
}

export interface DonorProfile {
  id: string
  name: string
  email: string
  totalDonated: number
  donationCount: number
  favoriteCategories: string[]
  createdAt: string
}

export type CategoryType = 
  | 'Religieuse'
  | 'Éducation'
  | 'Santé'
  | 'Environnement'
  | 'Humanitaire'
  | 'Culture'
  | 'Sport'
  | 'Social'

export type CampaignStatus = Campaign['status']
