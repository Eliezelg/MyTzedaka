import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RelatedContent } from '@/components/hub/related-content'

// Mock des données de test
const mockRelatedItems = [
  {
    id: '1',
    type: 'association' as const,
    title: 'Association Test 1',
    description: 'Description test association 1',
    location: 'Paris',
    category: 'Social',
    isVerified: true,
    totalCampaigns: 3,
    activeCampaigns: 1,
    totalRaised: 15000,
    createdAt: '2024-01-01T10:00:00Z',
    score: 0.95
  },
  {
    id: '2', 
    type: 'campaign' as const,
    title: 'Campagne Test 1',
    description: 'Description test campagne 1',
    category: 'Éducation',
    targetAmount: 10000,
    currentAmount: 7500,
    donorCount: 25,
    daysLeft: 15,
    associationName: 'Association Parent',
    isUrgent: false,
    createdAt: '2024-02-01T10:00:00Z',
    score: 0.88
  }
]

// Mock du service de recherche
jest.mock('@/lib/search-service', () => ({
  searchRelatedContent: jest.fn().mockResolvedValue(mockRelatedItems)
}))

describe('RelatedContent', () => {
  const defaultProps = {
    currentId: 'test-id',
    currentType: 'association' as const,
    showType: 'association' as const,
    algorithm: 'similar' as const,
    maxItems: 3,
    variant: 'cards' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche le titre correctement', () => {
    render(<RelatedContent {...defaultProps} />)
    
    expect(screen.getByText('Associations similaires')).toBeInTheDocument()
  })

  it('affiche les éléments liés après le chargement', async () => {
    render(<RelatedContent {...defaultProps} />)
    
    // Vérifie l'état de chargement initial
    expect(screen.getByText('Chargement du contenu similaire...')).toBeInTheDocument()
    
    // Attend que les données soient chargées
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })
  })

  it('permet de filtrer par catégorie', async () => {
    render(<RelatedContent {...defaultProps} showType="all" />)
    
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })

    // Clique sur le filtre "Social"
    const socialFilter = screen.getByText('Social')
    fireEvent.click(socialFilter)
    
    // Vérifie que le filtre est actif
    expect(socialFilter).toHaveClass('bg-blue-600')
  })

  it('permet de changer le tri', async () => {
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })

    // Clique sur le bouton de tri
    const sortButton = screen.getByText('Plus récent')
    fireEvent.click(sortButton)
    
    // Le composant devrait re-trier les résultats
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })
  })

  it('affiche le bon nombre d\'éléments selon maxItems', async () => {
    const propsWithLimit = { ...defaultProps, maxItems: 1 }
    render(<RelatedContent {...propsWithLimit} />)
    
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })

    // Ne devrait afficher qu'un seul élément
    expect(screen.queryByText('Campagne Test 1')).not.toBeInTheDocument()
  })

  it('gère les variantes d\'affichage', () => {
    const { rerender } = render(<RelatedContent {...defaultProps} variant="list" />)
    
    // Test variant list
    expect(document.querySelector('.space-y-3')).toBeInTheDocument()
    
    // Test variant carousel
    rerender(<RelatedContent {...defaultProps} variant="carousel" />)
    expect(document.querySelector('.grid-cols-1')).toBeInTheDocument()
  })

  it('affiche un message quand aucun contenu n\'est trouvé', async () => {
    // Mock pour retourner une liste vide
    const { searchRelatedContent } = require('@/lib/search-service')
    searchRelatedContent.mockResolvedValueOnce([])
    
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Aucun contenu similaire trouvé.')).toBeInTheDocument()
    })
  })

  it('gère les erreurs de chargement', async () => {
    // Mock pour simuler une erreur
    const { searchRelatedContent } = require('@/lib/search-service')
    searchRelatedContent.mockRejectedValueOnce(new Error('Erreur réseau'))
    
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement du contenu similaire.')).toBeInTheDocument()
    })
  })

  it('permet d\'afficher plus de contenu', async () => {
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })

    // Clique sur "Voir plus"
    const voirPlusButton = screen.getByText('Voir plus')
    fireEvent.click(voirPlusButton)
    
    // Devrait augmenter la limite d'affichage
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })
  })
})
