'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  ExternalLink, 
  Heart, 
  MapPin, 
  Calendar,
  Filter,
  Sparkles,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Fonctions utilitaires locales
function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Aujourd'hui"
  if (diffInDays === 1) return "Hier"
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`
  return `Il y a ${Math.floor(diffInDays / 365)} ans`
}

interface RelatedContentProps {
  currentId: string
  currentType: 'association' | 'campaign'
  associationId?: string
  variant?: 'cards' | 'list' | 'carousel'
  maxItems?: number
  showType?: 'all' | 'association' | 'campaign'
  algorithm?: 'similar' | 'popular' | 'recent' | 'related'
  className?: string
}

interface RelatedItem {
  id: string
  type: 'association' | 'campaign'
  title: string
  description: string
  image: string
  location: string
  category: string
  isVerified?: boolean
  stats: {
    value: number
    label: string
    unit?: string
  }
  progress?: {
    current: number
    target: number
    percentage: number
  }
  createdAt: string
  score: number // Score de pertinence
}

export function RelatedContent({
  currentId,
  currentType,
  associationId,
  variant = 'cards',
  maxItems = 6,
  showType = 'all',
  algorithm = 'similar',
  className = ''
}: RelatedContentProps) {
  const t = useTranslations('components.related')
  const [items, setItems] = useState<RelatedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const loadRelatedContent = async () => {
      setIsLoading(true)
      
      // TODO: Remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Simuler l'algorithme de recommandation
      let relatedItems = [...mockRelatedItems]
      
      // Filtrer selon le type demandé
      if (showType !== 'all') {
        relatedItems = relatedItems.filter(item => item.type === showType)
      }
      
      // Exclure l'élément actuel
      relatedItems = relatedItems.filter(item => item.id !== currentId)
      
      // Appliquer l'algorithme de tri
      switch (algorithm) {
        case 'popular':
          relatedItems.sort((a, b) => b.stats.value - a.stats.value)
          break
        case 'recent':
          relatedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'related':
          // Si c'est une campagne, prioriser les autres campagnes de la même association
          if (currentType === 'campaign' && associationId) {
            relatedItems = relatedItems.filter(item => 
              item.type === 'campaign' || item.id === associationId
            )
          }
          relatedItems.sort((a, b) => b.score - a.score)
          break
        case 'similar':
        default:
          relatedItems.sort((a, b) => b.score - a.score)
          break
      }
      
      setItems(relatedItems.slice(0, maxItems))
      setIsLoading(false)
    }

    loadRelatedContent()
  }, [currentId, currentType, associationId, showType, algorithm, maxItems])

  const filteredItems = selectedCategory 
    ? items.filter(item => item.category === selectedCategory)
    : items

  const categories = [...new Set(items.map(item => item.category))]

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
        <div className={`grid gap-4 ${variant === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {Array.from({ length: maxItems }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-300 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-3"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('title')}
        </h3>
        <p className="text-gray-600">
          {t('explore')} {currentType === 'association' ? t('associations') : t('campaigns')}
        </p>
      </div>
    )
  }

  const getAlgorithmTitle = () => {
    switch (algorithm) {
      case 'popular': return t('popular')
      case 'recent': return t('recent')
      case 'related': return currentType === 'campaign' ? t('otherCampaigns') : t('relatedContent')
      case 'similar':
      default: return t('title')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {getAlgorithmTitle()}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {filteredItems.length} {t('itemsFound', { count: filteredItems.length })}
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant={!selectedCategory ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t('all')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Grille de contenu */}
      <div className={`grid gap-6 ${
        variant === 'list' 
          ? 'grid-cols-1' 
          : variant === 'carousel'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <RelatedItemCard 
              item={item} 
              variant={variant}
              showProgress={item.type === 'campaign'}
            />
          </motion.div>
        ))}
      </div>

      {/* Lien voir plus */}
      {items.length >= maxItems && (
        <div className="text-center pt-4">
          <Link 
            href={`/${showType === 'all' ? 'search' : showType === 'association' ? 'associations' : 'campaigns'}?related=${currentId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('viewMore')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

interface RelatedItemCardProps {
  item: RelatedItem
  variant: 'cards' | 'list' | 'carousel'
  showProgress?: boolean
}

function RelatedItemCard({ item, variant, showProgress }: RelatedItemCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  
  const href = `/${item.type === 'association' ? 'associations' : 'campaigns'}/${item.id}`
  
  if (variant === 'list') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Image
              src={item.image}
              alt={item.title}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link href={href}>
                  <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.type === 'association' ? 'Association' : 'Campagne'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.isVerified && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                      Vérifié
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="flex-shrink-0"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(item.createdAt))}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-blue-600">
                  {item.stats.value}{item.stats.unit} {item.stats.label}
                </div>
              </div>
            </div>
            
            {showProgress && item.progress && (
              <div className="mt-3">
                <Progress value={item.progress.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(item.progress.current, 'EUR')} collectés</span>
                  <span>{item.progress.percentage.toFixed(0)}% de l'objectif</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <Image
          src={item.image}
          alt={item.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            {item.type === 'association' ? 'Association' : 'Campagne'}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          {item.isVerified && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Vérifié
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs mb-2">
            {item.category}
          </Badge>
          <Link href={href}>
            <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
              {item.title}
            </h4>
          </Link>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {item.description}
        </p>
        
        {showProgress && item.progress && (
          <div className="mb-3">
            <Progress value={item.progress.percentage} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatCurrency(item.progress.current, 'EUR')}</span>
              <span>{item.progress.percentage.toFixed(0)}%</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3 h-3" />
            {item.location}
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-blue-600">
              {item.stats.value}{item.stats.unit} {item.stats.label}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(item.createdAt))}
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Voir
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              <Filter className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Données mock pour les tests
const mockRelatedItems: RelatedItem[] = [
  {
    id: '2',
    type: 'association',
    title: 'Aide à l\'Enfance Lyon',
    description: 'Association dédiée à l\'aide aux enfants en difficulté dans la région lyonnaise',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=200&fit=crop',
    location: 'Lyon',
    category: 'Enfance',
    isVerified: true,
    stats: { value: 23, label: 'campagnes', unit: '' },
    createdAt: '2022-06-20T10:00:00Z',
    score: 0.85
  },
  {
    id: '3',
    type: 'campaign',
    title: 'Vacances pour tous les enfants',
    description: 'Organiser des vacances éducatives pour les enfants défavorisés',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
    location: 'Lyon',
    category: 'Enfance',
    stats: { value: 85, label: 'donateurs', unit: '' },
    progress: { current: 18500, target: 30000, percentage: 61.7 },
    createdAt: '2024-03-01T10:00:00Z',
    score: 0.78
  },
  {
    id: '4',
    type: 'association',
    title: 'Secours Populaire Marseille',
    description: 'Aide alimentaire et sociale pour les familles en difficulté',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=200&fit=crop',
    location: 'Marseille',
    category: 'Social',
    isVerified: true,
    stats: { value: 156, label: 'bénévoles', unit: '' },
    createdAt: '2021-09-15T10:00:00Z',
    score: 0.72
  },
  {
    id: '5',
    type: 'campaign',
    title: 'Rénovation de l\'école communautaire',
    description: 'Modernisation de l\'infrastructure éducative de notre communauté',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=200&fit=crop',
    location: 'Paris 11ème',
    category: 'Éducation',
    stats: { value: 42, label: 'donateurs', unit: '' },
    progress: { current: 15800, target: 40000, percentage: 39.5 },
    createdAt: '2024-04-10T10:00:00Z',
    score: 0.69
  },
  {
    id: '6',
    type: 'campaign',
    title: 'Aide alimentaire d\'urgence',
    description: 'Distribution de repas pour les familles en précarité',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=200&fit=crop',
    location: 'Bordeaux',
    category: 'Social',
    stats: { value: 127, label: 'donateurs', unit: '' },
    progress: { current: 8200, target: 15000, percentage: 54.7 },
    createdAt: '2024-05-01T10:00:00Z',
    score: 0.65
  },
  {
    id: '7',
    type: 'association',
    title: 'Protection Environnementale',
    description: 'Actions pour la préservation de l\'environnement local',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop',
    location: 'Toulouse',
    category: 'Environnement',
    stats: { value: 89, label: 'projets', unit: '' },
    createdAt: '2023-03-12T10:00:00Z',
    score: 0.58
  }
]
