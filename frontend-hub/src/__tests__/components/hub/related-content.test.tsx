import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RelatedContent } from '@/components/hub/related-content'
import { searchRelatedContent } from '@/lib/search-service'

// Mock des données de test
const mockRelatedItems = [
  {
    id: '1',
    title: 'Association Test 1',
    type: 'association' as const,
    description: 'Description test 1',
    category: 'Education',
    verified: true,
    image: '/test-image-1.jpg'
  },
  {
    id: '2', 
    title: 'Campagne Test 2',
    type: 'campaign' as const,
    description: 'Description test 2',
    category: 'Santé',
    verified: false,
    image: '/test-image-2.jpg'
  }
]

// Mock du service de recherche
jest.mock('@/lib/search-service', () => ({
  searchRelatedContent: jest.fn()
}))

describe('RelatedContent', () => {
  const defaultProps = {
    currentId: '1',
    currentType: 'association' as const,
    variant: 'carousel' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(searchRelatedContent as jest.Mock).mockResolvedValue(mockRelatedItems)
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
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Association Test 1')).toBeInTheDocument()
    })

    // Clique sur le filtre "Education"
    const educationFilter = screen.getByText('Education')
    fireEvent.click(educationFilter)
    
    // Vérifie que le filtre est actif
    expect(educationFilter).toHaveClass('bg-blue-600')
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
    expect(screen.queryByText('Campagne Test 2')).not.toBeInTheDocument()
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
    ;(searchRelatedContent as jest.Mock).mockResolvedValueOnce([])
    
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Aucun contenu similaire trouvé.')).toBeInTheDocument()
    })
  })

  it('gère les erreurs de chargement', async () => {
    // Mock pour simuler une erreur
    ;(searchRelatedContent as jest.Mock).mockRejectedValueOnce(new Error('Erreur réseau'))
    
    render(<RelatedContent {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement')).toBeInTheDocument()
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

  describe('animations', () => {
    beforeEach(() => {
      // Mock pour IntersectionObserver
      global.IntersectionObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }))
    })

    it('anime l\'apparition des éléments', async () => {
      render(<RelatedContent {...defaultProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Association Test 1')).toBeInTheDocument()
      })
    })
  })

  it('adapte l\'affichage selon le variant', () => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    })
    
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
    window.HTMLElement.prototype.scrollIntoView = jest.fn()

    render(<RelatedContent currentId="test" currentType="association" variant="list" />)
    expect(screen.getByText('Contenu similaire')).toBeInTheDocument()
  })

  it('affiche les éléments en mode carousel', () => {
    const mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    })
    
    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
    window.HTMLElement.prototype.scrollIntoView = jest.fn()

    render(<RelatedContent currentId="test" currentType="association" variant="carousel" />)
    expect(screen.getByText('Contenu similaire')).toBeInTheDocument()
  })
})
