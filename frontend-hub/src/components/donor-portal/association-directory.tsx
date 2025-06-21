'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDonorFavorites, useToggleFavoriteAssociation, useDonorProfile } from '@/hooks/use-donor-profile'
import { useAuth } from '@/contexts/AuthContext'
import { useAssociations } from '@/hooks/use-associations'
import Link from 'next/link'
import Image from 'next/image'

interface DirectoryFilters {
  search?: string
  country?: string
  category?: string
  page: number
  limit: number
}

export function AssociationDirectory() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<DirectoryFilters>({
    page: 1,
    limit: 12
  })

  // Récupération du profil donateur pour obtenir l'ID
  const { data: donorProfile } = useDonorProfile(user?.email)

  // Récupération des associations avec filtres
  const { data: associationsData, isLoading: associationsLoading } = useAssociations({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    country: filters.country,
    category: filters.category
  })

  // Récupération des favoris du donateur
  const { data: favorites = [], isLoading: favoritesLoading } = useDonorFavorites(donorProfile?.id)
  
  // Mutation pour toggle favori
  const toggleFavorite = useToggleFavoriteAssociation()

  const handleFilterChange = (key: keyof DirectoryFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value) // Ensure page is always a number
    }))
  }

  const handleToggleFavorite = async (tenantId: string) => {
    if (!donorProfile?.id) return
    
    try {
      await toggleFavorite.mutateAsync({
        donorProfileId: donorProfile.id,
        tenantId,
        action: 'toggle'
      })
    } catch (error) {
      console.error('Erreur lors du toggle favori:', error)
    }
  }

  const isFavorite = (tenantId: string) => {
    return Array.isArray(favorites) && favorites.some((fav: any) => fav.tenantId === tenantId)
  }

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      EDUCATION: { label: 'Éducation', color: 'bg-blue-100 text-blue-800' },
      HEALTH: { label: 'Santé', color: 'bg-green-100 text-green-800' },
      SOCIAL: { label: 'Social', color: 'bg-purple-100 text-purple-800' },
      RELIGIOUS: { label: 'Religieux', color: 'bg-yellow-100 text-yellow-800' },
      CULTURE: { label: 'Culture', color: 'bg-pink-100 text-pink-800' },
      HUMANITARIAN: { label: 'Humanitaire', color: 'bg-red-100 text-red-800' },
      ENVIRONMENT: { label: 'Environnement', color: 'bg-emerald-100 text-emerald-800' },
      OTHER: { label: 'Autre', color: 'bg-gray-100 text-gray-800' },
    }

    const config = categoryConfig[category as keyof typeof categoryConfig] || 
                   { label: category, color: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (associationsLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton des filtres */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton de la grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const associations = associationsData?.data || []
  const pagination = associationsData?.pagination || { page: 1, limit: 12, total: 0, pages: 0 }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher des associations</CardTitle>
          <CardDescription>
            Découvrez et suivez vos associations préférées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <Input
                id="search"
                placeholder="Nom ou description..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="country">Pays</Label>
              <Select
                value={filters.country || 'all'}
                onValueChange={(value) => handleFilterChange('country', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Belgique">Belgique</SelectItem>
                  <SelectItem value="Suisse">Suisse</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Israël">Israël</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="EDUCATION">Éducation</SelectItem>
                  <SelectItem value="HEALTH">Santé</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="RELIGIOUS">Religieux</SelectItem>
                  <SelectItem value="CULTURE">Culture</SelectItem>
                  <SelectItem value="HUMANITARIAN">Humanitaire</SelectItem>
                  <SelectItem value="ENVIRONMENT">Environnement</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Par page</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, limit: 12 })}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {pagination.total} association{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
        </div>
        {favorites.length > 0 && (
          <Badge variant="outline">
            {favorites.length} favori{favorites.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Grille des associations */}
      {associations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Aucune association trouvée pour ces critères
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associations.map((association: any) => {
            const favorite = isFavorite(association.tenantId)
            
            return (
              <Card key={association.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {association.logo ? (
                        <Image
                          src={association.logo}
                          alt={`Logo ${association.name}`}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-500">
                            {association.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">
                          {association.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {association.location || association.country}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(association.tenantId)}
                      disabled={toggleFavorite.isPending || !donorProfile?.id}
                      className="shrink-0"
                    >
                      <span className={`text-lg ${favorite ? 'text-red-500' : 'text-gray-400'}`}>
                        {favorite ? '❤️' : '🤍'}
                      </span>
                    </Button>
                  </div>

                  <div className="mb-4">
                    {association.category && getCategoryBadge(association.category)}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {association.description || 'Aucune description disponible'}
                  </p>

                  {association.activeCampaignsCount > 0 && (
                    <div className="text-sm text-blue-600 mb-4">
                      {association.activeCampaignsCount} campagne{association.activeCampaignsCount > 1 ? 's' : ''} active{association.activeCampaignsCount > 1 ? 's' : ''}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/fr/associations/${association.slug}`}>
                      <Button size="sm" className="flex-1">
                        Voir l'association
                      </Button>
                    </Link>
                    
                    <Link 
                      href={association.siteUrl || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Site web
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {pagination.page} sur {pagination.pages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => handleFilterChange('page', pagination.page - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => handleFilterChange('page', pagination.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
