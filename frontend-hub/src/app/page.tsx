'use client'

import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building, Users, TrendingUp, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

// Composants réutilisables
import { HeroSection } from '@/components/hub/hero-section'
import { StatCard } from '@/components/hub/stat-card'
import { AssociationCard } from '@/components/hub/association-card'
import { CampaignCard } from '@/components/hub/campaign-card'
import { Button } from '@/components/ui/button'
import { LoadingState, CardLoader } from '@/components/ui/loading-states'
import { StaggerContainer, StaggerItem } from '@/components/ui/page-transition'

// Types et utilitaires
import { HubStats, Association, Campaign } from '@/types/hub'

// API calls
async function fetchHubStats(): Promise<HubStats> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hub/stats`)
  if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
  return response.json()
}

async function fetchFeaturedAssociations(): Promise<Association[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hub/associations?limit=6`)
  if (!response.ok) throw new Error('Erreur lors du chargement des associations')
  return response.json()
}

async function fetchPopularCampaigns(): Promise<Campaign[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hub/campaigns/popular?limit=6`)
  if (!response.ok) throw new Error('Erreur lors du chargement des campagnes')
  return response.json()
}

function StatsSection() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['hub-stats'],
    queryFn: fetchHubStats,
  })

  if (error || !stats) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Erreur lors du chargement des statistiques</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Une communauté qui grandit chaque jour
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez l'impact de notre plateforme à travers ces chiffres qui témoignent 
            de l'engagement de notre communauté.
          </p>
        </motion.div>

        <LoadingState
          isLoading={isLoading}
          loadingComponent={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardLoader key={i} />
              ))}
            </div>
          }
        >
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <StatCard
                title="Associations actives"
                value={stats?.totalAssociations || 0}
                icon={Building}
                color="primary"
                delay={0}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Associations vérifiées"
                value={stats?.verifiedAssociations || 0}
                icon={Heart}
                color="accent"
                delay={0.1}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Campagnes en cours"
                value={stats?.activeCampaigns || 0}
                icon={TrendingUp}
                color="secondary"
                delay={0.2}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Total collecté"
                value={stats?.totalAmount || 0}
                icon={Users}
                color="orange"
                format="currency"
                delay={0.3}
              />
            </StaggerItem>
          </StaggerContainer>
        </LoadingState>
      </div>
    </section>
  )
}

function FeaturedAssociationsSection() {
  const { data: associations, isLoading, error } = useQuery({
    queryKey: ['featured-associations'],
    queryFn: fetchFeaturedAssociations,
  })

  if (error || !associations?.length) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Associations partenaires
          </h2>
          <p className="text-gray-500">Aucune association trouvée</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Associations partenaires
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez des associations vérifiées et engagées qui œuvrent chaque jour pour 
            et transforment positivement notre société.
          </p>
        </motion.div>

        <LoadingState
          isLoading={isLoading}
          loadingComponent={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardLoader key={i} />
              ))}
            </div>
          }
        >
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {associations?.map((association) => (
              <StaggerItem key={association.id}>
                <AssociationCard
                  association={association}
                  onClick={(assoc) => {
                    console.log('Clic sur association:', assoc.name)
                    // Navigation vers la page de l'association
                  }}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </LoadingState>

        <div className="text-center">
          <Button variant="outline" size="lg">
            Voir toutes les associations
          </Button>
        </div>
      </div>
    </section>
  )
}

function PopularCampaignsSection() {
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['popular-campaigns'],
    queryFn: fetchPopularCampaigns,
  })

  if (error || !campaigns?.length) {
    return (
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Campagnes populaires
          </h2>
          <p className="text-gray-500">Aucune campagne trouvée</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Campagnes populaires
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Participez aux campagnes de financement les plus soutenues par notre communauté 
            et contribuez à des projets qui font la différence.
          </p>
        </motion.div>

        <LoadingState
          isLoading={isLoading}
          loadingComponent={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardLoader key={i} />
              ))}
            </div>
          }
        >
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {campaigns?.map((campaign) => (
              <StaggerItem key={campaign.id}>
                <CampaignCard
                  campaign={campaign}
                  onClick={(camp) => {
                    console.log('Clic sur campagne:', camp.title)
                    // Navigation vers la page de la campagne
                  }}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </LoadingState>

        <div className="text-center">
          <Button variant="outline" size="lg">
            Voir toutes les campagnes
          </Button>
        </div>
      </div>
    </section>
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
        <FeaturedAssociationsSection />
      </Suspense>

      <Suspense fallback={<div>Chargement...</div>}>
        <PopularCampaignsSection />
      </Suspense>
    </main>
  )
}
