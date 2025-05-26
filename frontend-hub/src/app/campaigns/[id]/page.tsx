'use client'

import { useState } from 'react'
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
  ExternalLink,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useCampaign } from '@/hooks/useCampaign'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  const { 
    data: campaign, 
    isLoading, 
    error 
  } = useCampaign(campaignId)
  
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedTab, setSelectedTab] = useState<'story' | 'progress'>('story')

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    if (navigator.share && campaign) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Erreur lors du partage:', error)
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href)
      // TODO: Afficher une notification
    }
  }

  const handleDonate = (amount: number) => {
    // TODO: Rediriger vers la page de donation
    console.log(`Donation de ${amount}€ pour la campagne ${campaign?.id}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-300 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-6"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Campagne non trouvée
          </h1>
          <p className="text-gray-600 mb-6">
            La campagne que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link href="/campaigns">
            <Button>
              Retour aux campagnes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // No data state
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  const progressPercentage = (Number(campaign.raised || 0) / Number(campaign.goal)) * 100
  const suggestedAmounts = [25, 50, 100, 250]
  const tabs = [
    { id: 'story', label: 'Histoire', icon: MessageCircle },
    { id: 'progress', label: 'Progression', icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/campaigns" className="text-gray-600 hover:text-gray-900">
                ← Retour aux campagnes
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleFavoriteToggle}>
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
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
                {campaign.coverImage ? (
                  <Image
                    src={campaign.coverImage}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Heart className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2">
                    {campaign.status === 'ACTIVE' ? 'Campagne active' : campaign.status}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {campaign.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span>Campagne #{campaign.id}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistiques de la campagne */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Number(campaign.raised || 0).toLocaleString()}€
                  </div>
                  <div className="text-sm text-gray-600">collectés sur {Number(campaign.goal).toLocaleString()}€</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {campaign.donationsCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">donateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </div>
                  <div className="text-sm text-gray-600">jours restants</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progressPercentage.toFixed(1)}% de l'objectif</span>
                  <span>{(Number(campaign.goal) - Number(campaign.raised || 0)).toLocaleString()}€ restants</span>
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
                      onClick={() => setSelectedTab(tab.id as any)}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-2">Informations</h3>
                          <div className="space-y-2 text-blue-800 text-sm">
                            <div className="flex justify-between">
                              <span>Début:</span>
                              <span>{new Date(campaign.startDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fin:</span>
                              <span>{new Date(campaign.endDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Devise:</span>
                              <span>{campaign.currency}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">Statut</h3>
                          <div className="space-y-2 text-green-800 text-sm">
                            <div className="flex justify-between">
                              <span>État:</span>
                              <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {campaign.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Active:</span>
                              <span>{campaign.isActive ? 'Oui' : 'Non'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTab === 'progress' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold">Progression de la campagne</h2>
                      
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4">Statistiques détaillées</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {progressPercentage.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-600">Progression</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {Number(campaign.raised || 0).toLocaleString()}€
                              </div>
                              <div className="text-sm text-gray-600">Collecté</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {Number(campaign.goal).toLocaleString()}€
                              </div>
                              <div className="text-sm text-gray-600">Objectif</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {(Number(campaign.goal) - Number(campaign.raised || 0)).toLocaleString()}€
                              </div>
                              <div className="text-sm text-gray-600">Restant</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Barre de progression détaillée</h4>
                          <Progress value={progressPercentage} className="h-4 mb-2" />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>0€</span>
                            <span className="font-medium">
                              {Number(campaign.raised || 0).toLocaleString()}€ / {Number(campaign.goal).toLocaleString()}€
                            </span>
                            <span>{Number(campaign.goal).toLocaleString()}€</span>
                          </div>
                        </div>
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
                    variant={selectedAmount === amount ? "secondary" : "outline"}
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

              {/* Informations sur la campagne */}
              <div className="border-t pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Créée le:</span>
                    <span className="font-medium">
                      {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mise à jour:</span>
                    <span className="font-medium">
                      {new Date(campaign.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Campagne:</span>
                    <span className="font-mono text-xs">{campaign.id.slice(-8)}</span>
                  </div>
                </div>
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
                  <Button variant="outline" size="sm" onClick={handleShare}>
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
