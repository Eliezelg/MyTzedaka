'use client'

import { Suspense, useState, useEffect } from 'react'
import { SearchBar } from '@/components/hub/search-bar'
import { FilterPanel, type FilterOptions } from '@/components/hub/filter-panel'
import { Pagination } from '@/components/ui/pagination'
import { EnhancedAssociationCard } from '@/components/ui/enhanced-card'
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/page-transition'
import { CardLoader } from '@/components/ui/loading-states'
import { ToastProvider, useToastHelpers } from '@/components/ui/toast'
import { useAssociations, type AssociationsFilters } from '@/lib/services/associations-service'
import { useUrlState } from '@/hooks/useUrlState'
import { useTranslations } from 'next-intl'

// Interface étendue pour les filtres des associations
interface AssociationFilterOptions extends FilterOptions {
  sortBy: 'name' | 'totalRaised' | 'donationsCount' | 'createdAt'
  sortOrder: 'asc' | 'desc'
  page: number
}

// Convertir FilterOptions vers AssociationsFilters
const convertFiltersToAPI = (filters: AssociationFilterOptions & { search?: string }): AssociationsFilters => {
  return {
    category: filters.category || undefined,
    city: filters.location || undefined,
    isVerified: filters.verified || undefined,
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: 12, // 12 associations par page
  }
}

function AssociationsContent() {
  const t = useTranslations('associations')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useUrlState<AssociationFilterOptions>({
    category: '',
    location: '',
    verified: null,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1
  }, 'filters')
  
  const { success, error } = useToastHelpers()

  // Appel API pour récupérer les associations
  const apiFilters = convertFiltersToAPI({ ...filters, search: searchQuery })
  const { 
    data: associationsResponse, 
    isLoading, 
    error: apiError, 
    refetch 
  } = useAssociations(apiFilters)

  const associations = associationsResponse?.data || []
  const totalPages = associationsResponse?.meta?.totalPages || 1
  const totalCount = associationsResponse?.meta?.total || 0

  // Gestion des erreurs API avec useEffect pour éviter l'appel pendant le rendu
  useEffect(() => {
    if (apiError) {
      error(t('loading'))
    }
  }, [apiError, error])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters({ page: 1 }) // Reset page lors d'une nouvelle recherche
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters({ 
      ...newFilters, 
      sortBy: 'name', // valeurs par défaut
      sortOrder: 'asc',
      page: 1 // Reset page lors d'un changement de filtre
    })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
    // Scroll to top lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRefresh = () => {
    refetch()
    success(t('empty.action'))
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('directory.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('directory.description')}
              {totalCount > 0 && (
                <span className="block mt-2 font-medium text-blue-600">
                  {t('search.resultsCount', { count: totalCount })}
                </span>
              )}
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder={t('search.placeholder')}
              className="max-w-2xl mx-auto"
            />
          </div>

          {/* Contenu principal */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Panel de filtres */}
            <div className="lg:w-80 flex-shrink-0">
              <FilterPanel 
                onFiltersChange={handleFilterChange}
                totalResults={totalCount}
                isLoading={isLoading}
              />
            </div>

            {/* Liste des associations */}
            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <CardLoader key={i} />
                    ))}
                  </div>
                </div>
              ) : associations.length > 0 ? (
                <StaggerContainer>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {associations.map((association, index) => (
                      <StaggerItem key={association.id}>
                        <EnhancedAssociationCard
                          association={{
                            ...association,
                            location: `${association.city || ''}${association.city && association.country ? ', ' : ''}${association.country || ''}`,
                            image: association.logoUrl || `https://images.unsplash.com/photo-${1559027615 + index}-cd4628902d4a?w=300&h=200&fit=crop`
                          }}
                        />
                      </StaggerItem>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination
                        currentPage={filters.page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </StaggerContainer>
              ) : (
                <div className="text-center py-16">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('empty.title')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('empty.description')}
                  </p>
                  <button 
                    onClick={handleRefresh}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('empty.action')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default function AssociationsPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des associations...</p>
          </div>
        </div>
      }>
        <AssociationsContent />
      </Suspense>
    </ToastProvider>
  )
}
