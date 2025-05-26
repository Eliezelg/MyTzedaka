'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown, MapPin, Tag, CheckCircle, Calendar, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useUrlState } from '@/hooks/useUrlState'

interface FilterOptions {
  category: string
  location: string
  verified: boolean | null
  minGoal?: number
  maxGoal?: number
  startDate?: string
  endDate?: string
  status?: 'active' | 'completed' | 'upcoming' | null
}

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterOptions) => void
  totalResults?: number
  isLoading?: boolean
  className?: string
  defaultFilters?: Partial<FilterOptions>
}

export function FilterPanel({
  onFiltersChange,
  totalResults = 0,
  isLoading = false,
  className = "",
  defaultFilters = {}
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Utiliser le hook URL state pour persister les filtres
  const { state: filters, updateState: setFilters } = useUrlState<FilterOptions>({
    category: '',
    location: '',
    verified: null,
    minGoal: undefined,
    maxGoal: undefined,
    startDate: undefined,
    endDate: undefined,
    status: null,
    ...defaultFilters
  }, 'filters')

  const categories = [
    'Toutes les catégories',
    'Éducation',
    'Santé',
    'Action sociale',
    'Culture',
    'Sport',
    'Environnement',
    'Aide humanitaire',
    'Religion'
  ]

  const locations = [
    'Toutes les locations',
    'Paris',
    'Lyon',
    'Marseille',
    'Toulouse',
    'Nice',
    'Strasbourg',
    'Bordeaux',
    'Lille',
    'Montpellier'
  ]

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    const defaultState: FilterOptions = {
      category: '',
      location: '',
      verified: null,
      minGoal: undefined,
      maxGoal: undefined,
      startDate: undefined,
      endDate: undefined,
      status: null
    }
    setFilters(defaultState)
    onFiltersChange?.(defaultState)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category && filters.category !== 'Toutes les catégories') count++
    if (filters.location && filters.location !== 'Toutes les locations') count++
    if (filters.verified !== null) count++
    if (filters.minGoal) count++
    if (filters.maxGoal) count++
    if (filters.startDate) count++
    if (filters.endDate) count++
    if (filters.status) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* En-tête du panneau de filtres */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtres</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          {totalResults > 0 && (
            <span className="text-sm text-gray-500">
              ({totalResults} résultat{totalResults > 1 ? 's' : ''})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </Button>
        </div>
      </div>

      {/* Filtres rapides (toujours visibles) */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Catégorie
            </label>
            <Select
              value={filters.category || 'Toutes les catégories'}
              onValueChange={(value) => 
                handleFilterChange('category', value === 'Toutes les catégories' ? '' : value)
              }
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Localisation
            </label>
            <Select
              value={filters.location || 'Toutes les locations'}
              onValueChange={(value) => 
                handleFilterChange('location', value === 'Toutes les locations' ? '' : value)
              }
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>
          </div>

          {/* Vérification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Statut
            </label>
            <Select
              value={filters.verified === null ? 'Toutes' : filters.verified ? 'Vérifiées' : 'Non vérifiées'}
              onValueChange={(value) => {
                if (value === 'Toutes') handleFilterChange('verified', null)
                else if (value === 'Vérifiées') handleFilterChange('verified', true)
                else handleFilterChange('verified', false)
              }}
            >
              <option value="Toutes">Toutes</option>
              <option value="Vérifiées">Vérifiées uniquement</option>
              <option value="Non vérifiées">Non vérifiées</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Filtres avancés (extensibles) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <h4 className="font-medium text-gray-900 text-sm">Filtres avancés</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plage d'objectifs financiers */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Objectif financier (€)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minGoal || ''}
                      onChange={(e) => handleFilterChange('minGoal', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxGoal || ''}
                      onChange={(e) => handleFilterChange('maxGoal', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Statut des campagnes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Statut des campagnes
                  </label>
                  <Select
                    value={filters.status || 'Tous les statuts'}
                    onValueChange={(value) => 
                      handleFilterChange('status', value === 'Tous les statuts' ? null : value)
                    }
                  >
                    <option value="Tous les statuts">Tous les statuts</option>
                    <option value="active">Actives</option>
                    <option value="completed">Terminées</option>
                    <option value="upcoming">À venir</option>
                  </Select>
                </div>

                {/* Plage de dates */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Actions avancées */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {isLoading ? 'Filtrage en cours...' : `${totalResults} résultat${totalResults > 1 ? 's' : ''} trouvé${totalResults > 1 ? 's' : ''}`}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résumé des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== 'Toutes les catégories' && (
              <Badge variant="outline" className="text-xs">
                {filters.category}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('category', '')}
                />
              </Badge>
            )}
            
            {filters.location && filters.location !== 'Toutes les locations' && (
              <Badge variant="outline" className="text-xs">
                {filters.location}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('location', '')}
                />
              </Badge>
            )}
            
            {filters.verified !== null && (
              <Badge variant="outline" className="text-xs">
                {filters.verified ? 'Vérifiées' : 'Non vérifiées'}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('verified', null)}
                />
              </Badge>
            )}
            
            {filters.status && (
              <Badge variant="outline" className="text-xs">
                {filters.status}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('status', null)}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
