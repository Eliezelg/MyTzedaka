'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  Copy,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Campaign, Association } from '@/types/hub'

// Données mock étendues
const mockCampaign: Campaign & {
  association: Association
  raised: number
  donationsCount: number
  daysLeft: number
  updates: Array<{
    id: string
    title: string
    content: string
    date: string
    author: string
  }>
  recentDonations: Array<{
    id: string
    amount: number
    donor: string
    message?: string
    date: string
  }>
} = {
  id: '1',
  tenantId: 'kehilat-paris',
  userId: 'user1',
  title: 'Rénovation de la salle communautaire',
  description: 'Notre salle communautaire a besoin d\'une rénovation complète pour continuer à accueillir nos membres dans les meilleures conditions. Ce projet comprend la modernisation de l\'équipement audiovisuel, la réfection de la peinture, l\'amélioration de l\'éclairage et l\'installation de nouvelles chaises plus confortables.',
  goal: 50000,
  raised: 32750,
  currency: 'EUR',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-06-30T23:59:59Z',
  status: 'ACTIVE',
  isActive: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  donationsCount: 87,
  daysLeft: 45,
  association: {
    id: '1',
    tenantId: 'kehilat-paris',
    name: 'Kehilat Paris',
    description: 'Centre communautaire juif parisien',
    logo: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=150&h=150&fit=crop&crop=center',
    category: 'Religion',
    location: 'Paris 17ème',
    isPublic: true,
    isVerified: true,
    totalCampaigns: 5,
    activeCampaigns: 2,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  updates: [
    {
      id: '1',
      title: 'Travaux commencés !',
      content: 'Les travaux de peinture ont commencé cette semaine. Nous sommes très reconnaissants pour votre soutien.',
      date: '2024-05-20T10:00:00Z',
      author: 'Équipe Kehilat Paris'
    },
    {
      id: '2',
      title: '65% de l\'objectif atteint !',
      content: 'Grâce à votre générosité, nous avons déjà collecté plus de la moitié des fonds nécessaires.',
      date: '2024-05-15T10:00:00Z',
      author: 'Équipe Kehilat Paris'
    }
  ],
  recentDonations: [
    {
      id: '1',
      amount: 100,
      donor: 'Sarah L.',
      message: 'Excellent projet ! Hâte de voir la salle rénovée.',
      date: '2024-05-25T14:30:00Z'
    },
    {
      id: '2',
      amount: 50,
      donor: 'David M.',
      date: '2024-05-25T12:15:00Z'
    },
    {
      id: '3',
      amount: 250,
      donor: 'Rachel K.',
      message: 'Pour une belle salle communautaire !',
      date: '2024-05-24T16:45:00Z'
    }
  ]
}

export default function CampaignDetailPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<typeof mockCampaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedTab, setSelectedTab] = useState<'story' | 'updates' | 'donations'>('story')

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setCampaign(mockCampaign)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Erreur partage:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleDonate = (amount: number) => {
    // TODO: Intégrer avec le système de paiement
    console.log('Don de', amount, '€')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campagne non trouvée</h1>
          <Link href="/associations">
            <Button variant="outline">Retour aux associations</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progressPercentage = (campaign.raised / campaign.goal) * 100
  const suggestedAmounts = [25, 50, 100, 250]

  const tabs = [
    { id: 'story', label: 'Histoire', icon: MessageCircle },
    { id: 'updates', label: 'Actualités', icon: TrendingUp },
    { id: 'donations', label: 'Donations', icon: Heart }
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/associations">
              <Button variant="ghost" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Retour aux associations
              </Button>
            </Link>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero de la campagne */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop"
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2">
                    {campaign.status === 'ACTIVE' ? 'Campagne active' : campaign.status}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {campaign.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <Link 
                      href={`/associations/${campaign.association.id}`}
                      className="flex items-center gap-2 hover:text-white"
                    >
                      <Image
                        src={campaign.association.logo!}
                        alt={campaign.association.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="font-medium">{campaign.association.name}</span>
                      {campaign.association.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistiques de la campagne */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {campaign.raised.toLocaleString()}€
                  </div>
                  <div className="text-sm text-gray-600">collectés sur {campaign.goal.toLocaleString()}€</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {campaign.donationsCount}
                  </div>
                  <div className="text-sm text-gray-600">donateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {campaign.daysLeft}
                  </div>
                  <div className="text-sm text-gray-600">jours restants</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progressPercentage.toFixed(1)}% de l'objectif</span>
                  <span>{(campaign.goal - campaign.raised).toLocaleString()}€ restants</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </Card>

            {/* Navigation par onglets */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <nav className="flex border-b border-gray-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                        selectedTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>

              <div className="p-6">
                <motion.div
                  key={selectedTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedTab === 'story' && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-4">Description du projet</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {campaign.description}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Utilisation des fonds</h3>
                        <ul className="space-y-2 text-blue-800">
                          <li>• Équipement audiovisuel moderne : 20 000€</li>
                          <li>• Peinture et décoration : 15 000€</li>
                          <li>• Éclairage LED : 8 000€</li>
                          <li>• Nouvelles chaises : 7 000€</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'updates' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold">Actualités de la campagne</h2>
                      
                      <div className="space-y-4">
                        {campaign.updates.map((update) => (
                          <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <h3 className="font-semibold text-gray-900">{update.title}</h3>
                            <p className="text-gray-700 mt-1">{update.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(update.date).toLocaleDateString('fr-FR')}</span>
                              <span>•</span>
                              <span>{update.author}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTab === 'donations' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold">Donations récentes</h2>
                      
                      <div className="space-y-4">
                        {campaign.recentDonations.map((donation) => (
                          <div key={donation.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Heart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{donation.donor}</span>
                                <span className="font-bold text-green-600">{donation.amount}€</span>
                              </div>
                              {donation.message && (
                                <p className="text-gray-600 text-sm mt-1">"{donation.message}"</p>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(donation.date).toLocaleDateString('fr-FR')} à {new Date(donation.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Sidebar - Widget de donation */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 sticky top-4">
              <h3 className="text-xl font-bold mb-4 text-center">Soutenir ce projet</h3>
              
              {/* Montants suggérés */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {suggestedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                  >
                    {amount}€
                  </Button>
                ))}
              </div>

              {/* Montant personnalisé */}
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Autre montant"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bouton de don */}
              <Button 
                className="w-full mb-4" 
                size="lg"
                onClick={() => {
                  const amount = selectedAmount || parseInt(customAmount)
                  if (amount) handleDonate(amount)
                }}
                disabled={!selectedAmount && !customAmount}
              >
                <Heart className="w-4 h-4 mr-2" />
                Faire un don
              </Button>

              {/* Informations sur l'association */}
              <div className="border-t pt-4">
                <Link 
                  href={`/associations/${campaign.association.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <Image
                    src={campaign.association.logo!}
                    alt={campaign.association.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-1">
                      {campaign.association.name}
                      {campaign.association.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{campaign.association.location}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </div>

              {/* Partage */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Partagez cette campagne</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
