'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Heart,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { CampaignCard } from '@/components/hub/campaign-card'
import { SocialShare } from '@/components/hub/social-share'
import { CommentSystem } from '@/components/hub/comment-system'
import { ImpactMetrics } from '@/components/hub/impact-metrics'
import { RelatedContent } from '@/components/hub/related-content'
import { useAssociation } from '@/lib/services/associations-service'
import type { AssociationWithCampaigns } from '@/hooks/useAssociation'
import type { Association, Campaign } from '@/lib/hub-client'
import { formatDistanceToNow } from '@/utils/format'

export default function AssociationDetailPage() {
  const params = useParams()
  const associationId = params.id as string
  
  const { 
    data: association, 
    isLoading, 
    error 
  } = useAssociation(associationId) as {
    data: AssociationWithCampaigns | undefined, 
    isLoading: boolean,
    error: Error | null
  }
  
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'impact' | 'about'>('overview')
  const [showFullDescription, setShowFullDescription] = useState(false)

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
  }

  // No data state
  if (!association) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
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
            Association non trouvée
          </h1>
          <p className="text-gray-600 mb-6">
            L'association que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link href="/associations">
            <Button>
              Retour aux associations
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.example.com'
  const currentUrl = baseUrl + '/associations/' + (association?.id || '')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs
            items={[
              { label: 'Accueil', href: '/' },
              { label: association?.name || '', href: `/associations/${association?.id}` },
              { label: association?.name || '', href: `#` }
            ]}
          />
        </div>
      </div>

      {/* En-tête avec image de couverture */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="flex items-end gap-6 w-full">
            {/* Logo de l'association */}
            <div className="relative">
              {association?.logo ? (
                <Image
                  src={association.logo}
                  alt={association.name || ''}
                  width={120}
                  height={120}
                  className="rounded-2xl border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-2xl border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl font-bold">
                    {association?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {association?.isVerified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{association?.name}</h1>
                {association?.isVerified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Vérifié
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {association?.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Depuis {new Date(association?.createdAt).getFullYear()}
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {association?.category}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleFavoriteToggle}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Suivi' : 'Suivre'}
              </Button>
              
              <SocialShare
                url={currentUrl}
                title={association?.name}
                description={association?.description}
                variant="modal"
                className="[&>button]:bg-white/20 [&>button]:border-white/30 [&>button]:text-white [&>button]:hover:bg-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d&apos;ensemble', icon: TrendingUp },
              { id: 'campaigns', label: `Campagnes (${association?.campaigns?.length || 0})`, icon: Heart },
              { id: 'impact', label: 'Impact', icon: Award },
              { id: 'about', label: 'À propos', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Description */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">À propos de {association?.name}</h3>
                  <div className="prose max-w-none">
                    <p className={`text-gray-700 leading-relaxed ${!showFullDescription ? 'line-clamp-4' : ''}`}>
                      {association?.description}
                    </p>
                    
                    {association?.description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mt-2"
                      >
                        {showFullDescription ? (
                          <>
                            Voir moins <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Voir plus <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card>

                {/* Métriques d'impact résumé */}
                <ImpactMetrics
                  targetId={association?.id}
                  targetType="association"
                  variant="summary"
                  showGrowth={true}
                />

                {/* Campagnes en vedette */}
                {association?.campaigns && association.campaigns.length > 0 ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Campagnes en cours</h3>
                      <Link 
                        href={`/campaigns?association=${association?.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Voir toutes les campagnes
                      </Link>
                    </div>
                    
                    <div className="grid gap-4">
                      {association.campaigns.slice(0, 2).map((campaign: Campaign | undefined) => 
                        campaign ? (
                          <div key={campaign.id} className="border rounded-lg p-4">
                            <h4 className="font-bold mb-2">{campaign.title}</h4>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {campaign.description}
                            </p>
                            <div className="space-y-2">
                              <Progress 
                                value={(campaign.raised || 0) / Number(campaign.goal) * 100} 
                                className="h-2" 
                              />
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {(campaign.raised || 0).toLocaleString()}€ collectés
                                </span>
                                <span className="text-gray-600">
                                  Objectif: {Number(campaign.goal).toLocaleString()}€
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune campagne disponible
                  </div>
                )}
                
                {/* Contenu similaire */}
                <RelatedContent
                  currentId={association?.id}
                  currentType="association"
                  showType="association"
                  algorithm="similar"
                  maxItems={3}
                  variant="cards"
                />
              </motion.div>
            )}

            {/* Onglet Campagnes */}
            {activeTab === 'campaigns' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Campagnes</h2>
                  <p className="text-gray-600">{association?.campaigns?.length || 0} campagne(s)</p>
                </div>

                <div className="grid gap-6">
                  {association?.campaigns?.map((campaign: Campaign) => (
                    campaign && (
                      <div key={campaign.id} className="border rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-3">{campaign.title}</h3>
                        <p className="text-gray-600 mb-4">{campaign.description}</p>
                        <div className="space-y-3">
                          <Progress 
                            value={(campaign.raised || 0) / Number(campaign.goal) * 100} 
                            className="h-3" 
                          />
                          <div className="flex justify-between text-sm">
                            <span>
                              {(campaign.raised || 0).toLocaleString()}€ collectés sur {Number(campaign.goal).toLocaleString()}€
                            </span>
                            <span>
                              {Math.round((campaign.raised || 0) / Number(campaign.goal) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                              {campaign.isActive ? 'active' : 'inactive'}
                            </Badge>
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Button size="sm">Voir détails</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  ) || (
                    <div className="text-center py-8 text-gray-500">
                      Aucune campagne disponible
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Onglet Impact */}
            {activeTab === 'impact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <ImpactMetrics
                  targetId={association?.id}
                  targetType="association"
                  variant="full"
                  showGrowth={true}
                  showGoals={true}
                  showAchievements={true}
                />
              </motion.div>
            )}

            {/* Onglet À propos */}
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Informations détaillées */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-6">Informations détaillées</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            contact@kehilat-paris.org
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            +33 1 23 45 67 89
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="w-4 h-4" />
                            <a href="#" className="text-blue-600 hover:underline">
                              www.kehilat-paris.org
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Statut</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">Association vérifiée</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600">Reconnue d&apos;utilité publique</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-600">
                              Créée le {new Date(association?.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Mission et valeurs</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {association?.description}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Système de commentaires */}
                <CommentSystem
                  targetId={association?.id}
                  targetType="association"
                  allowComments={true}
                  currentUserId="user-current"
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques rapides */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campagnes totales</span>
                  <span className="font-semibold">{association?.campaigns?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campagnes actives</span>
                  <span className="font-semibold">{association?.campaigns?.filter((c: Campaign) => c.isActive)?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(association?.createdAt))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière activité</span>
                  <span className="font-semibold">
                    {formatDistanceToNow(new Date(association?.updatedAt))}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions rapides */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Heart className="w-4 h-4 mr-2" />
                  Faire un don
                </Button>
                
                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contacter
                </Button>
                
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Site web
                </Button>
              </div>
            </Card>

            {/* Associations similaires */}
            <RelatedContent
              currentId={association?.id}
              currentType="association"
              showType="association"
              algorithm="similar"
              maxItems={3}
              variant="list"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
