'use client'

import { Suspense } from 'react'
import { Building, Users, TrendingUp, Heart } from 'lucide-react'

// Composants réutilisables
import { HeroSection } from '@/components/hub/hero-section'
import { StatCard } from '@/components/hub/stat-card'
import { AssociationCard } from '@/components/hub/association-card'
import { CampaignCard } from '@/components/hub/campaign-card'
import { Button } from '@/components/ui/button'
import { CardLoader } from '@/components/ui/loading-states'
import { StaggerContainer, StaggerItem } from '@/components/ui/page-transition'

// Nouveaux hooks API Hub
import { useHubStats, useAssociations, useCampaigns } from '@/hooks/useHub'

// Types et transformateurs
import { HubStats, CampaignStatus } from '@/lib/types/backend'
import { transformAssociationListings, transformCampaignListings } from '@/lib/utils/type-transformers'

function StatsSection() {
  const { data: stats, isLoading, error } = useHubStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardLoader key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Erreur lors du chargement des statistiques
        </p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  const statItems = stats ? [
    {
      title: 'Associations',
      value: (stats as HubStats).totalAssociations,
      icon: Building,
      description: 'Associations actives'
    },
    {
      title: 'Donateurs',
      value: (stats as HubStats).totalDonations,
      icon: Users,
      description: 'Personnes qui donnent'
    },
    {
      title: 'Montant collecté',
      value: `${(stats as HubStats).totalAmount.toLocaleString()}€`,
      icon: TrendingUp,
      description: 'Total des dons'
    },
    {
      title: 'Campagnes',
      value: (stats as HubStats).totalCampaigns,
      icon: Heart,
      description: 'Campagnes actives'
    }
  ] : []

  return (
    <StaggerContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat) => (
          <StaggerItem key={stat.title}>
            <StatCard {...stat} />
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  )
}

function FeaturedAssociations() {
  const { data: associations, isLoading, error } = useAssociations({ 
    limit: 6,
    sortBy: 'totalRaised',
    sortOrder: 'desc'
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardLoader key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Erreur lors du chargement des associations: {error?.message || 'Erreur inconnue'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  const associationsList = associations?.data ? transformAssociationListings(associations.data) : []

  if (!associationsList || associationsList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Aucune association trouvée</p>
      </div>
    )
  }

  return (
    <StaggerContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {associationsList.map((association) => (
          <StaggerItem key={association.id}>
            <AssociationCard association={association} />
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  )
}

function PopularCampaigns() {
  const { data: campaigns, isLoading, error } = useCampaigns({ 
    limit: 6,
    sortBy: 'currentAmount',
    sortOrder: 'desc',
    status: CampaignStatus.ACTIVE
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardLoader key={i} className="h-80" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Erreur lors du chargement des campagnes
        </p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  const campaignsList = campaigns ? transformCampaignListings(Array.isArray(campaigns) ? campaigns : []) : []

  return (
    <StaggerContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaignsList.map((campaign) => (
          <StaggerItem key={campaign.id}>
            <CampaignCard campaign={campaign} />
          </StaggerItem>
        ))}
      </div>
    </StaggerContainer>
  )
}

export default function HomePage() {
  return (
    <main>
      <HeroSection
        onSearchClick={() => {
          console.log('Recherche clicked')
          // Navigation vers la page de recherche
        }}
        onExploreClick={() => {
          console.log('Explorer clicked')
          // Navigation vers la page des associations
        }}
      />

      <Suspense fallback={<div>Chargement...</div>}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<div>Chargement...</div>}>
        <FeaturedAssociations />
      </Suspense>

      <Suspense fallback={<div>Chargement...</div>}>
        <PopularCampaigns />
      </Suspense>
    </main>
  )
}
