'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Users, 
  ExternalLink, 
  Phone, 
  Mail, 
  Globe, 
  Heart, 
  Share2, 
  ArrowLeft,
  CheckCircle,
  Star
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Association, Campaign } from '@/types/hub'
import { CampaignCard } from '@/components/hub/campaign-card'

// Données mock pour le développement
const mockAssociation: Association = {
  id: '1',
  tenantId: 'kehilat-paris',
  name: 'Kehilat Paris - Centre Communautaire',
  description: 'Centre communautaire juif proposant des services religieux, éducatifs et sociaux pour la communauté parisienne. Nous organisons des événements culturels, des cours de judaïsme et des actions solidaires.',
  logo: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=150&h=150&fit=crop&crop=center',
  coverImage: 'https://images.unsplash.com/photo-1551845041-63d0d249c3ad?w=1200&h=400&fit=crop&crop=center',
  category: 'Religion',
  location: 'Paris 17ème',
  isPublic: true,
  isVerified: true,
  hasSite: true,
  siteUrl: 'https://kehilat-paris.org',
  totalCampaigns: 5,
  activeCampaigns: 2,
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    tenantId: 'kehilat-paris',
    userId: 'user1',
    title: 'Rénovation de la salle communautaire',
    description: 'Collecte pour moderniser notre salle communautaire et améliorer l\'accueil.',
    goal: 50000,
    currency: 'EUR',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    _count: { donations: 23 }
  },
  {
    id: '2',
    tenantId: 'kehilat-paris',
    userId: 'user1',
    title: 'Programme éducatif jeunesse',
    description: 'Financement des activités éducatives pour les jeunes de la communauté.',
    goal: 25000,
    currency: 'EUR',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    _count: { donations: 15 }
  }
]

export default function AssociationDetailPage() {
  const params = useParams()
  const [association, setAssociation] = useState<Association | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'about' | 'campaigns' | 'impact' | 'contact'>('about')

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setAssociation(mockAssociation)
      setCampaigns(mockCampaigns)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    // TODO: Intégrer avec l'API favoris
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: association?.name,
          text: association?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Erreur partage:', error)
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href)
      // TODO: Afficher toast de confirmation
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton loading */}
        <div className="animate-pulse">
          <div className="h-96 bg-gray-300"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!association) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Association non trouvée</h1>
          <Link href="/associations">
            <Button variant="outline">Retour aux associations</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'about', label: 'À propos', icon: Users },
    { id: 'campaigns', label: 'Campagnes', icon: ExternalLink },
    { id: 'impact', label: 'Impact', icon: Heart },
    { id: 'contact', label: 'Contact', icon: Mail }
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        {association.coverImage && (
          <Image
            src={association.coverImage}
            alt={association.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Breadcrumb et actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/associations">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className="text-white hover:bg-white/20"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="flex items-end gap-6">
            {association.logo && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={association.logo}
                  alt={association.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{association.name}</h1>
                {association.isVerified && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{association.location}</span>
                </div>
                <Badge variant="outline" className="text-white border-white/30">
                  {association.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  <span>{association.activeCampaigns} campagnes actives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedTab === 'about' && (
                <div className="space-y-8">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">À propos de {association.name}</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {association.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{association.totalCampaigns}</div>
                        <div className="text-sm text-gray-600">Campagnes créées</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{association.activeCampaigns}</div>
                        <div className="text-sm text-gray-600">Campagnes actives</div>
                      </div>
                    </div>
                  </Card>

                  {/* Galerie photos - Placeholder */}
                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Galerie photos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-lg">
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Star className="w-8 h-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {selectedTab === 'campaigns' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Campagnes de {association.name}</h2>
                    <Badge variant="outline">{campaigns.length} campagnes</Badge>
                  </div>
                  
                  <div className="grid gap-6">
                    {campaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'impact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Impact et réalisations</h2>
                  
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Nos réalisations récentes</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold">Rénovation de la bibliothèque</h4>
                        <p className="text-gray-600 text-sm">Modernisation complète avec 200 nouveaux ouvrages</p>
                        <p className="text-xs text-gray-500">Janvier 2024</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold">Programme d&apos;aide alimentaire</h4>
                        <p className="text-gray-600 text-sm">Distribution hebdomadaire pour 50 familles</p>
                        <p className="text-xs text-gray-500">Décembre 2023</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {selectedTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Contactez-nous</h2>
                  
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span>contact@kehilat-paris.org</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span>01 42 85 63 92</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>15 rue de la Paix, 75017 Paris</span>
                      </div>
                      {association.siteUrl && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <a 
                            href={association.siteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Site web officiel
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Widget de donation */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h3 className="text-xl font-bold mb-4 text-center">Soutenez {association.name}</h3>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Votre don contribue directement aux actions de l&apos;association
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[25, 50, 100, 200].map((amount) => (
                    <Button key={amount} variant="outline" size="sm">
                      {amount}€
                    </Button>
                  ))}
                </div>
                
                <Button className="w-full" size="lg">
                  <Heart className="w-4 h-4 mr-2" />
                  Faire un don
                </Button>
              </div>
            </Card>

            {/* Associations similaires */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Associations similaires</h3>
              <div className="space-y-4">
                {/* Placeholder pour associations similaires */}
                <p className="text-gray-500 text-sm">
                  Découvrez d&apos;autres associations dans la catégorie &quot;{association.category}&quot;
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Voir plus
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
