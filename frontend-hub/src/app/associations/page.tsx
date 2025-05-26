'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

// Composants réutilisables
import { SearchBar } from '@/components/hub/search-bar'
import { FilterPanel, FilterOptions } from '@/components/hub/filter-panel'
import { AssociationCard } from '@/components/hub/association-card'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import { SkeletonCard } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

// Types
import { Association } from '@/types/hub'

interface AssociationsResponse {
  associations: Association[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface SearchParams {
  query?: string
  category?: string
  location?: string
  verified?: boolean | null
  sortBy?: string
  page?: number
  limit?: number
}

// API fonction
async function searchAssociations(params: SearchParams): Promise<AssociationsResponse> {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hub/associations/search?${searchParams}`
  )
  
  if (!response.ok) {
    throw new Error("Erreur lors de la recherche des associations")
  }
  
  return response.json()
}

export default function AssociationsPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'relevance'
  })

  // Query pour récupérer les associations
  const {
    data: response,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['associations', searchParams],
    queryFn: () => searchAssociations(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({
      ...prev,
      query,
      page: 1
    }))
  }

  const handleFilterChange = (filters: FilterOptions) => {
    setSearchParams(prev => ({
      ...prev,
      ...filters,
      page: 1, // Reset à la première page
      verified: filters.verified === null ? undefined : filters.verified
    }))
  }

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }))
    
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearSearch = () => {
    setSearchParams({
      page: 1,
      limit: 12,
      sortBy: 'relevance'
    })
  }

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div className="min-h-screen bg-gray-50/50">
        {/* Header de la page */}
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Découvrez nos associations
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explorez une communauté d'associations engagées pour des causes qui vous tiennent à cœur.
              </p>
            </motion.div>

            {/* Barre de recherche */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center"
            >
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClearSearch}
                defaultValue={searchParams.query}
              />
            </motion.div>
          </div>
        </section>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Panel de filtres */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24"
              >
                <div className="bg-white rounded-xl border p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Filtres de recherche
                  </h3>
                  <FilterPanel onFiltersChange={handleFilterChange} />
                </div>
              </motion.div>
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              {/* Informations sur les résultats */}
              {response && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between mb-6"
                >
                  <PaginationInfo
                    currentPage={response.page}
                    totalPages={response.totalPages}
                    totalItems={response.total}
                    itemsPerPage={response.limit}
                  />
                  
                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <span className="text-sm text-gray-600">
                      {searchParams.query && `Recherche: "${searchParams.query}"`}
                      {searchParams.category && ` • Catégorie: ${searchParams.category}`}
                      {searchParams.location && ` • Lieu: ${searchParams.location}`}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* États de chargement et d'erreur */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-600 mb-4">
                      Erreur lors du chargement des associations
                    </p>
                    <Button onClick={() => refetch()} variant="outline">
                      Réessayer
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Aucun résultat */}
              {response && response.associations.length === 0 && !isLoading && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Aucune association trouvée pour '{searchParams.query}'
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Essayez de modifier vos critères de recherche ou vos filtres.
                  </p>
                  <Button onClick={handleClearSearch} variant="outline">
                    Effacer les filtres
                  </Button>
                </motion.div>
              )}

              {/* Grille des associations */}
              {response && response.associations.length > 0 && !isLoading && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
                  >
                    {response.associations.map((association, index) => (
                      <AssociationCard
                        key={association.id}
                        association={association}
                        index={index}
                        onClick={(assoc) => {
                          console.log('Navigation vers association:', assoc.id)
                          // TODO: Router vers la page de l'association
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Pagination */}
                  {response.totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="flex justify-center"
                    >
                      <Pagination
                        currentPage={response.page}
                        totalPages={response.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
