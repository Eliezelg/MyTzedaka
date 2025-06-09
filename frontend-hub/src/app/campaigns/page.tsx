'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Star, MapPin, Calendar, Users, TrendingUp, Target, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useCampaigns } from '@/hooks/useCampaign'
import { Campaign } from '@/types/campaign'
import Image from 'next/image'
import Link from 'next/link'

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')

  const { 
    data: campaigns, 
    isLoading, 
    error 
  } = useCampaigns({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter
  })

  const filteredCampaigns = campaigns?.campaigns?.filter((campaign: Campaign) => 
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const getStatusBadge = (campaign: Campaign) => {
    const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0
    
    if (progress >= 100) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Complétée</Badge>
    }
    if (campaign.isActive) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>
    }
    return <Badge variant="outline">Inactive</Badge>
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Terminée'
    if (diffDays === 0) return 'Dernière jour'
    if (diffDays === 1) return '1 jour restant'
    return `${diffDays} jours restants`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des campagnes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des campagnes</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Toutes les Campagnes
        </h1>
        <p className="text-gray-600 mb-6">
          Découvrez et soutenez les campagnes de collecte en cours
        </p>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une campagne..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              Toutes
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('active')}
              size="sm"
            >
              Actives
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter('completed')}
              size="sm"
            >
              Complétées
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campagnes</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns?.campaigns?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campagnes Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns?.campaigns?.filter((c: Campaign) => c.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Se Terminent Bientôt</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns?.campaigns?.filter((c: Campaign) => {
                    if (!c.endDate) return false
                    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return daysLeft <= 7 && daysLeft > 0
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des campagnes */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune campagne trouvée</p>
          {searchQuery && (
            <Button 
              variant="secondary"
              onClick={() => setSearchQuery('')}
              className="mt-4"
            >
              Réinitialiser la recherche
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign: Campaign) => {
            const progress = campaign.goal > 0 ? Math.min((campaign.raised / campaign.goal) * 100, 100) : 0

            return (
              <Link href={`/campaigns/${campaign.id}`} key={campaign.id}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    {/* Image de la campagne */}
                    <div className="relative h-48 w-full">
                      {campaign.coverImage ? (
                        <Image
                          src={campaign.coverImage}
                          alt={campaign.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
                          <div className="text-center">
                            <Target className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                            <span className="text-sm text-blue-700 font-medium">
                              {campaign.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        {getStatusBadge(campaign)}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {campaign.title}
                      </h3>
                      
                      {campaign.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}

                      {/* Progression */}
                      {campaign.goal > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Collecté</span>
                            <span className="font-semibold text-gray-900">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2 mb-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-900 font-medium">
                              {campaign.raised.toLocaleString('fr-FR')} €
                            </span>
                            <span className="text-gray-600">
                              / {campaign.goal.toLocaleString('fr-FR')} €
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Informations temporelles */}
                      {campaign.endDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {getDaysRemaining(campaign.endDate)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
