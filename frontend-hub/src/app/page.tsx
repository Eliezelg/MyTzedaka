'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Building, Users, TrendingUp, Heart } from 'lucide-react'

// Composants UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Hooks existants qui fonctionnent
import { useAssociations } from '@/lib/services/associations-service'
import { useCampaigns } from '@/hooks/useCampaign'

// Hero Section Simple
function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          MyTzedaka Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Découvrez et soutenez les associations juives dans leurs missions caritatives
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/associations">
            <Button size="lg" className="w-full sm:w-auto">
              Explorer les Associations
            </Button>
          </Link>
          <Link href="/campaigns">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Voir les Campagnes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Section Statistiques Calculées
function StatsSection() {
  const { data: associations, isLoading: loadingAssociations } = useAssociations({ limit: 100 })
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns({ limit: 100 })

  if (loadingAssociations || loadingCampaigns) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Chiffres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Calcul des statistiques à partir des données existantes
  const totalAssociations = associations?.data?.length || 0
  const totalCampaigns = campaigns?.campaigns?.length || 0
  const activeCampaigns = campaigns?.campaigns?.filter((c) => c.isActive)?.length || 0
  const totalRaised = campaigns?.campaigns?.reduce((sum: number, c) => sum + (Number(c.raised) || 0), 0) || 0

  const stats = [
    {
      title: 'Associations',
      value: totalAssociations,
      icon: Building,
      description: 'Associations actives',
      color: 'text-blue-600'
    },
    {
      title: 'Campagnes',
      value: totalCampaigns,
      icon: Heart,
      description: 'Total des campagnes',
      color: 'text-red-600'
    },
    {
      title: 'Actives',
      value: activeCampaigns,
      icon: TrendingUp,
      description: 'Campagnes en cours',
      color: 'text-green-600'
    },
    {
      title: 'Collecté',
      value: `${totalRaised.toLocaleString('fr-FR')} €`,
      icon: Users,
      description: 'Total des dons',
      color: 'text-purple-600'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Chiffres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <IconComponent className={`h-8 w-8 ${stat.color} mx-auto mb-4`} />
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Section Associations Populaires
function FeaturedAssociations() {
  const { data: associationsData, isLoading, error } = useAssociations({ 
    limit: 6,
    page: 1
  })

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Associations en Vedette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Associations en Vedette</h2>
          <p className="text-red-600 mb-4">Erreur lors du chargement</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </section>
    )
  }

  const associations = associationsData?.data || []

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Associations en Vedette</h2>
          <p className="text-gray-600">Découvrez les associations qui ont besoin de votre soutien</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associations.slice(0, 6).map((association: any) => (
            <Link href={`/associations/${association.id}`} key={association.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {association.logo ? (
                      <img 
                        src={association.logo} 
                        alt={association.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">
                          {association.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                        {association.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {association.category || 'Association'}
                      </p>
                    </div>
                  </div>
                  {association.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {association.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/associations">
            <Button variant="outline">
              Voir Toutes les Associations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Section Campagnes Populaires
function PopularCampaigns() {
  const { data: campaigns, isLoading, error } = useCampaigns({})

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Campagnes Populaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div className="h-48 bg-gray-200 rounded-t-lg animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Campagnes Populaires</h2>
          <p className="text-red-600 mb-4">Erreur lors du chargement</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </section>
    )
  }

  const activeCampaignsList = campaigns?.campaigns?.filter(c => c.isActive)?.slice(0, 6) || []

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Campagnes Populaires</h2>
          <p className="text-gray-600">Participez aux campagnes qui vous tiennent à cœur</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaignsList.map((campaign) => {
            const progress = campaign.goal 
              ? Math.min((Number(campaign.raised || 0) / Number(campaign.goal)) * 100, 100) 
              : 0

            return (
              <Link href={`/campaigns/${campaign.id}`} key={campaign.id}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48">
                    {campaign.coverImage ? (
                      <img 
                        src={campaign.coverImage} 
                        alt={campaign.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
                        <Heart className="h-12 w-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>
                    {campaign.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                    {campaign.goal && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Collecté</span>
                          <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-900">
                            {Number(campaign.raised || 0)?.toLocaleString('fr-FR')} €
                          </span>
                          <span className="text-gray-600">
                            / {Number(campaign.goal)?.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/campaigns">
            <Button variant="outline">
              Voir Toutes les Campagnes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      
      <Suspense fallback={<div className="py-16 text-center">Chargement...</div>}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<div className="py-16 text-center">Chargement...</div>}>
        <FeaturedAssociations />
      </Suspense>

      <Suspense fallback={<div className="py-16 text-center">Chargement...</div>}>
        <PopularCampaigns />
      </Suspense>
    </main>
  )
}
