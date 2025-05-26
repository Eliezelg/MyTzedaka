"use client"

import { Suspense, useState, useEffect } from 'react'
import { SearchBar } from '@/components/hub/search-bar'
import { FilterPanel, type FilterOptions } from '@/components/hub/filter-panel'
import { Pagination } from '@/components/ui/pagination'
import { EnhancedAssociationCard } from '@/components/ui/enhanced-card'
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/page-transition'
import { LoadingState, CardLoader } from '@/components/ui/loading-states'
import { ToastProvider, useToastHelpers } from '@/components/ui/toast'

// Mock data - sera remplacé par de vraies données API
const mockAssociations = [
  {
    id: '1',
    name: 'Kehilat Paris',
    description: 'Association pour l\'entraide communautaire à Paris et ses environs.',
    category: 'Éducation',
    location: 'Paris, France',
    isVerified: true,
    donationsCount: 156,
    totalRaised: 25430,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&h=200&fit=crop'
  },
  {
    id: '2', 
    name: 'Shalom Marseille',
    description: 'Aide alimentaire et soutien aux familles en difficulté.',
    category: 'Aide sociale',
    location: 'Marseille, France',
    isVerified: true,
    donationsCount: 89,
    totalRaised: 15620,
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Tikkun Olam Lyon',
    description: 'Projets environnementaux et développement durable.',
    category: 'Environnement',
    location: 'Lyon, France',
    isVerified: false,
    donationsCount: 34,
    totalRaised: 8920,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=200&fit=crop'
  }
]

function AssociationsContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [associations] = useState(mockAssociations)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(5)
  const { success, error } = useToastHelpers()

  // Simulation du chargement des données
  useEffect(() => {
    const loadAssociations = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1500))
        success('Associations chargées', 'Découvrez les associations de votre communauté')
      } catch {
        error('Erreur de chargement', 'Impossible de charger les associations')
      } finally {
        setIsLoading(false)
      }
    }

    loadAssociations()
  }, [success, error])

  const handleSearch = (query: string) => {
    // Le state est déjà mis à jour par SearchBar via useUrlState
    console.log('Recherche déclenchée:', query)
  }

  const handleFilterChange = (filters: FilterOptions) => {
    console.log('Filtres appliqués:', filters)
    success('Filtres appliqués', 'Les résultats ont été mis à jour')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll smooth vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        {/* Header avec animations */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Découvrez nos Associations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trouvez et soutenez les associations qui vous tiennent à cœur dans notre communauté.
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Rechercher une association..."
          />
          
          <FilterPanel 
            onFiltersChange={handleFilterChange}
          />
        </div>

        {/* Contenu principal avec gestion du loading */}
        <LoadingState 
          isLoading={isLoading} 
          loadingComponent={<CardLoader />}
          className="mb-8"
        >
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {associations.map((association) => (
              <StaggerItem key={association.id}>
                <EnhancedAssociationCard 
                  association={association}
                  className="h-full"
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </LoadingState>

        {/* Pagination avec animations */}
        {!isLoading && associations.length > 0 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* État vide avec animation */}
        {!isLoading && associations.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucune association trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Essayez de modifier vos critères de recherche ou filtres.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export default function AssociationsPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CardLoader />}>
        <AssociationsContent />
      </Suspense>
    </ToastProvider>
  )
}
