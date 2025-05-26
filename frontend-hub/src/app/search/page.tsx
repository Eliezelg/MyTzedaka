'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  MapPin,
  Grid,
  List,
  SortAsc,
  Star,
  Clock,
  TrendingUp,
  Download,
  BookmarkPlus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { SearchBar } from '@/components/hub/search-bar'
import { FilterPanel } from '@/components/hub/filter-panel'
import { AssociationCard } from '@/components/hub/association-card'
import { CampaignCard } from '@/components/hub/campaign-card'
import { Association, Campaign } from '@/types/hub'
import { useUrlState } from '@/hooks/useUrlState'

// Données mock étendues
const mockAssociations: Association[] = [
  {
    id: '1',
    tenantId: 'kehilat-paris',
    name: 'Kehilat Paris',
    description: 'Centre communautaire juif parisien proposant des services religieux et éducatifs',
    logo: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=150&h=150&fit=crop',
    category: 'Religion',
    location: 'Paris 17ème',
    isPublic: true,
    isVerified: true,
    totalCampaigns: 5,
    activeCampaigns: 2,
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    tenantId: 'aide-enfance',
    name: 'Aide à l\'Enfance',
    description: 'Association dédiée à l\'aide aux enfants en difficulté',
    logo: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=150&h=150&fit=crop',
    category: 'Enfance',
    location: 'Lyon',
    isPublic: true,
    isVerified: true,
    totalCampaigns: 8,
    activeCampaigns: 3,
    createdAt: '2022-06-20T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
]

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    tenantId: 'kehilat-paris',
    userId: 'user1',
    title: 'Rénovation de la salle communautaire',
    description: 'Collecte pour moderniser notre salle communautaire',
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
    tenantId: 'aide-enfance',
    userId: 'user2',
    title: 'Vacances pour tous',
    description: 'Organiser des vacances pour les enfants défavorisés',
    goal: 30000,
    currency: 'EUR',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-07-31T23:59:59Z',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    _count: { donations: 45 }
  }
]

interface SearchFilters {
  category?: string
  location?: string
  verification?: string
  type?: 'all' | 'associations' | 'campaigns'
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [searchState, updateSearchState] = useUrlState<{
    query: string
    filters: SearchFilters
    view: 'grid' | 'list'
    sort: 'relevance' | 'date' | 'popularity' | 'alphabetical'
  }>({
    query: '',
    filters: { type: 'all' },
    view: 'grid',
    sort: 'relevance'
  })

  const [results, setResults] = useState<{
    associations: Association[]
    campaigns: Campaign[]
    total: number
  }>({
    associations: [],
    campaigns: [],
    total: 0
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Initialisation depuis les paramètres URL
  useEffect(() => {
    const query = searchParams?.get('q') || ''
    const type = searchParams?.get('type') as 'all' | 'associations' | 'campaigns' || 'all'
    
    if (query || type !== 'all') {
      updateSearchState({
        query,
        filters: { type }
      })
    }
  }, [searchParams])

  // Fonction de recherche
  const performSearch = async () => {
    setIsLoading(true)
    
    // Simulation d'une recherche
    setTimeout(() => {
      let filteredAssociations = mockAssociations
      let filteredCampaigns = mockCampaigns

      // Filtrage par query
      if (searchState.query) {
        filteredAssociations = mockAssociations.filter(a => 
          a.name.toLowerCase().includes(searchState.query.toLowerCase()) ||
          a.description.toLowerCase().includes(searchState.query.toLowerCase()) ||
          a.category.toLowerCase().includes(searchState.query.toLowerCase())
        )
        filteredCampaigns = mockCampaigns.filter(c => 
          c.title.toLowerCase().includes(searchState.query.toLowerCase()) ||
          c.description.toLowerCase().includes(searchState.query.toLowerCase())
        )
      }

      // Filtrage par type
      if (searchState.filters.type === 'associations') {
        filteredCampaigns = []
      } else if (searchState.filters.type === 'campaigns') {
        filteredAssociations = []
      }

      // Filtrage par catégorie
      if (searchState.filters.category) {
        filteredAssociations = filteredAssociations.filter(a => 
          a.category === searchState.filters.category
        )
      }

      // Filtrage par localisation
      if (searchState.filters.location) {
        filteredAssociations = filteredAssociations.filter(a => 
          a.location.toLowerCase().includes(searchState.filters.location!.toLowerCase())
        )
      }

      // Filtrage par vérification
      if (searchState.filters.verification === 'verified') {
        filteredAssociations = filteredAssociations.filter(a => a.isVerified)
      }

      setResults({
        associations: filteredAssociations,
        campaigns: filteredCampaigns,
        total: filteredAssociations.length + filteredCampaigns.length
      })
      setIsLoading(false)
    }, 800)
  }

  useEffect(() => {
    performSearch()
  }, [searchState])

  const handleSearch = (query: string) => {
    updateSearchState({ query })
  }

  const handleFilterChange = (filters: SearchFilters) => {
    updateSearchState({ filters: { ...searchState.filters, ...filters } })
  }

  const breadcrumbItems = [
    { label: 'Recherche' }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Pertinence', icon: Star },
    { value: 'date', label: 'Plus récent', icon: Clock },
    { value: 'popularity', label: 'Popularité', icon: TrendingUp },
    { value: 'alphabetical', label: 'Alphabétique', icon: SortAsc }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Header de recherche */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Recherche</h1>
          <div className="max-w-3xl">
            <SearchBar
              onSearch={handleSearch}
              initialQuery={searchState.query}
              placeholder="Rechercher associations, campagnes..."
              showVoiceSearch
              showHistory
            />
          </div>
        </div>

        {/* Résultats et filtres */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar filtres */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filtres</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Type de contenu */}
                <div>
                  <h3 className="font-medium mb-3">Type</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Tout' },
                      { value: 'associations', label: 'Associations' },
                      { value: 'campaigns', label: 'Campagnes' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="type"
                          value={option.value}
                          checked={searchState.filters.type === option.value}
                          onChange={(e) => handleFilterChange({ type: e.target.value as any })}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <h3 className="font-medium mb-3">Catégorie</h3>
                  <select
                    value={searchState.filters.category || ''}
                    onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="Religion">Religion</option>
                    <option value="Enfance">Enfance</option>
                    <option value="Éducation">Éducation</option>
                    <option value="Santé">Santé</option>
                    <option value="Environnement">Environnement</option>
                  </select>
                </div>

                {/* Localisation */}
                <div>
                  <h3 className="font-medium mb-3">Localisation</h3>
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    value={searchState.filters.location || ''}
                    onChange={(e) => handleFilterChange({ location: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Vérification */}
                <div>
                  <h3 className="font-medium mb-3">Vérification</h3>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchState.filters.verification === 'verified'}
                      onChange={(e) => handleFilterChange({ 
                        verification: e.target.checked ? 'verified' : undefined 
                      })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Associations vérifiées uniquement</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Header des résultats */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  {isLoading ? (
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <h2 className="text-xl font-semibold">
                      {results.total} résultat{results.total > 1 ? 's' : ''}
                      {searchState.query && ` pour "${searchState.query}"`}
                    </h2>
                  )}
                </div>

                {results.total > 0 && (
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {results.associations.length} associations
                    </Badge>
                    <Badge variant="outline">
                      {results.campaigns.length} campagnes
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Tri */}
                <select
                  value={searchState.sort}
                  onChange={(e) => updateSearchState({ sort: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Vue */}
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={searchState.view === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => updateSearchState({ view: 'grid' })}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={searchState.view === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => updateSearchState({ view: 'list' })}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Actions */}
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>

            {/* Résultats */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-300 rounded"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : results.total === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou vos filtres.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => updateSearchState({ query: '', filters: { type: 'all' } })}
                >
                  Effacer les filtres
                </Button>
              </div>
            ) : (
              <div className={`space-y-6 ${searchState.view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                {/* Associations */}
                {results.associations.map((association) => (
                  <motion.div
                    key={association.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AssociationCard association={association} />
                  </motion.div>
                ))}

                {/* Campagnes */}
                {results.campaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
