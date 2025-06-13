'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Users, 
  MapPin, 
  Globe, 
  Mail, 
  Phone,
  Share2,
  TrendingUp,
  Calendar,
  ChevronRight,
  Award,
  MessageCircle,
  Target,
  ArrowRight,
  ExternalLink
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
import { DonationWidget } from '@/components/donation/DonationWidget'
import { useAssociationBySlug } from '@/lib/services/associations-service'
import type { AssociationFromAPI } from '@/types/association-with-campaigns'
import { formatDistanceToNow } from '@/utils/format'

export default function AssociationDetailPage() {
  const params = useParams()
  const associationSlug = params.slug as string

  const associationQuery = useAssociationBySlug(associationSlug)
  const { 
    data: association, 
    isLoading, 
    error 
  } = associationQuery as {
    data: AssociationFromAPI | undefined,
    isLoading: boolean,
    error: Error | null
  }

  // Helpers pour conversion des données
  const getTotalRaised = (association: AssociationFromAPI | undefined): number => {
    if (!association?.totalRaised) return 0
    return typeof association.totalRaised === 'string' 
      ? parseFloat(association.totalRaised) 
      : association.totalRaised
  }

  const [isFavorite, setIsFavorite] = useState(false)
  const [showAllCampaigns, setShowAllCampaigns] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'campaigns' | 'impact' | 'updates'>('about')

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Associations', href: '/associations' },
    { label: association?.name || 'Chargement...', href: '#', isActive: true }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Target className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement de l'association...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !association) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Association non trouvée</h1>
            <p className="text-gray-600 mb-6">
              L'association que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Debug: slug={associationSlug}, error={error?.message || 'none'}, loading={isLoading}
            </div>
            <Link href="/associations">
              <Button>
                Retour aux associations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal - 2/3 de la largeur */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start gap-6 mb-8">
                  {association.logo && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={association.logo}
                        alt={`Logo de ${association.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {association.category}
                      </Badge>
                      {association.isVerified && (
                        <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                          <Target className="w-3 h-3 mr-1" />
                          Vérifiée
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{association.name}</h1>
                    <p className="text-xl text-blue-100 leading-relaxed">
                      {association.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </Button>
                  <SocialShare 
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                    title={association.name}
                    description={association.description}
                  />
                </div>
              </motion.div>
            </div>

            {/* Widget de don - 1/3 de la largeur */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <DonationWidget
                  tenantId={association.tenantId}
                  title="Soutenir cette association"
                  description={`Votre don aide ${association.name} à poursuivre sa mission`}
                  suggestedAmounts={[25, 50, 100, 250]}
                  className="bg-white/95 backdrop-blur-sm"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques rapides */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getTotalRaised(association)}€
              </div>
              <div className="text-sm text-gray-600">Dons collectés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {association.donationsCount || 0}
              </div>
              <div className="text-sm text-gray-600">Donateurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {association.activeCampaigns || 0}
              </div>
              <div className="text-sm text-gray-600">Campagnes actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {association.totalCampaigns || 0}
              </div>
              <div className="text-sm text-gray-600">Total campagnes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation tabs */}
      <section className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'about', label: 'À propos' },
              { id: 'campaigns', label: 'Campagnes' },
              { id: 'impact', label: 'Impact' },
              { id: 'updates', label: 'Actualités' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* À propos */}
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">À propos de {association.name}</h2>
                  
                  <div className="prose max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed">
                      {association.description}
                    </p>
                  </div>

                  {/* Mission si disponible */}
                  {association.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Notre mission</h3>
                      <p className="text-gray-700">{association.description}</p>
                    </div>
                  )}

                  {/* Domaines d'action - remplacé par catégorie */}
                  {association.category && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Domaine d'activité</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {association.category}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Campagnes */}
            {activeTab === 'campaigns' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Campagnes actives</h2>
                    {(association.campaigns && association.campaigns.length > 3) && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllCampaigns(!showAllCampaigns)}
                      >
                        {showAllCampaigns ? (
                          <>
                            <ChevronRight className="w-4 h-4 mr-2" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4 mr-2" />
                            Voir toutes ({association.campaigns.length})
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-6">
                    {(association.campaigns && association.campaigns.length > 0) ? (
                      association.campaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
                          <p className="text-gray-600 mb-4">{campaign.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-4">
                              <div className="text-sm">
                                <span className="font-medium text-green-600">{campaign.raised || 0}€</span>
                                <span className="text-gray-500"> collectés</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-blue-600">{campaign.goal || 0}€</span>
                                <span className="text-gray-500"> objectif</span>
                              </div>
                            </div>
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                            `}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucune campagne active
                        </h3>
                        <p className="text-gray-600">
                          Cette association n'a pas encore lancé de campagne de collecte.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Impact */}
            {activeTab === 'impact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Métriques d'impact en cours de développement</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actualités */}
            {activeTab === 'updates' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Section actualités en cours de développement</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Informations</h3>
              <div className="space-y-4">
                {association.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Localisation</div>
                      <div className="text-sm text-gray-600">{association.location}</div>
                    </div>
                  </div>
                )}

                {association.siteUrl && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Site web</div>
                      <a 
                        href={association.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Visiter le site
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {association.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Email</div>
                      <a 
                        href={`mailto:${association.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {association.email}
                      </a>
                    </div>
                  </div>
                )}

                {association.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">Téléphone</div>
                      <a 
                        href={`tel:${association.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {association.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">Créée</div>
                    <div className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(association.createdAt))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistiques détaillées */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Objectif annuel</span>
                    <span>50,000€</span>
                  </div>
                  <Progress 
                    value={((getTotalRaised(association) || 0) / 50000) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    {Math.round(((getTotalRaised(association) || 0) / 50000) * 100)}% atteint
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round((getTotalRaised(association) || 0) / Math.max(association.donationsCount || 1, 1))}€
                    </div>
                    <div className="text-xs text-gray-600">Don moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {association.activeCampaigns || 0}
                    </div>
                    <div className="text-xs text-gray-600">Campagnes</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
