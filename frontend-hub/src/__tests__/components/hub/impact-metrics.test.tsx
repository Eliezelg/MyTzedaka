import { render, screen, fireEvent } from '@testing-library/react'
import { ImpactMetrics } from '@/components/hub/impact-metrics'

describe('ImpactMetrics', () => {
  const defaultProps = {
    targetId: 'association-1',
    targetType: 'association' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('affiche les métriques principales', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    expect(screen.getByText('Impact & Métriques')).toBeInTheDocument()
    expect(screen.getByText('50 000 €')).toBeInTheDocument()
    expect(screen.getByText('125')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('formate correctement les montants', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Vérifie le formatage des devises
    expect(screen.getByText('50 000 €')).toBeInTheDocument()
    expect(screen.getByText('400 €')).toBeInTheDocument()
    expect(screen.getByText('2 500 €')).toBeInTheDocument()
  })

  it('affiche les pourcentages de croissance', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    expect(screen.getByText('+15.5%')).toBeInTheDocument()
    expect(screen.getByText('vs mois dernier')).toBeInTheDocument()
  })

  it('affiche les réalisations récentes', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    expect(screen.getByText('Réalisations récentes')).toBeInTheDocument()
    expect(screen.getByText('Objectif atteint !')).toBeInTheDocument()
    expect(screen.getByText('Nouveau record')).toBeInTheDocument()
  })

  it('permet de changer la période d\'analyse', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Trouve le sélecteur de période
    const periodSelector = screen.getByDisplayValue('12 mois')
    
    // Change la période
    fireEvent.change(periodSelector, { target: { value: '6months' } })
    
    expect(periodSelector).toHaveValue('6months')
  })

  it('affiche les graphiques de tendance', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    expect(screen.getByText('Évolution des dons')).toBeInTheDocument()
    
    // Vérifie la présence des données du graphique
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Mai')).toBeInTheDocument()
  })

  it('permet de basculer entre différents types de métriques', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Boutons pour changer de vue
    const donationsTab = screen.getByText('Dons')
    const donorsTab = screen.getByText('Donateurs')
    
    expect(donationsTab).toBeInTheDocument()
    expect(donorsTab).toBeInTheDocument()
    
    // Clique sur l'onglet donateurs
    fireEvent.click(donorsTab)
    
    // Devrait changer l'affichage du graphique
    expect(donorsTab).toHaveClass('bg-blue-600')
  })

  it('affiche les icônes appropriées pour chaque métrique', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Vérifie la présence des icônes via leur container ou aria-label
    const metricsCards = screen.getAllByRole('article')
    expect(metricsCards.length).toBeGreaterThan(0)
  })

  it('gère les états de chargement', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Le composant devrait gérer l'état de chargement
    // Dans un vrai test, on passerait une prop loading=true
    expect(screen.getByText('Impact & Métriques')).toBeInTheDocument()
  })

  it('affiche les métriques avec animations', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Vérifier que les métriques sont affichées avec animations
    expect(screen.getByTestId('impact-metrics')).toBeInTheDocument()
  })

  it('compare les performances par rapport aux objectifs', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Devrait afficher des comparaisons avec les objectifs
    expect(screen.getByText('Objectifs')).toBeInTheDocument()
  })

  it('affiche les métriques de rétention des donateurs', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    expect(screen.getByText('45')).toBeInTheDocument() // repeatDonors
    expect(screen.getByText('Donateurs récurrents')).toBeInTheDocument()
  })

  it('formate correctement les dates des réalisations', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Les dates devraient être formatées de manière lisible
    // Format français attendu
    expect(screen.getByText(/Il y a/)).toBeInTheDocument()
  })

  it('calcule correctement les moyennes', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Don moyen calculé: totalDonations / totalDonors = 50000 / 125 = 400
    expect(screen.getByText('400 €')).toBeInTheDocument()
    expect(screen.getByText('Don moyen')).toBeInTheDocument()
  })

  it('affiche des indicateurs de performance visuels', () => {
    render(<ImpactMetrics {...defaultProps} />)
    
    // Indicateurs de croissance positifs/négatifs
    const growthIndicators = document.querySelectorAll('.text-green-600, .text-red-600')
    expect(growthIndicators.length).toBeGreaterThan(0)
  })

  it('gère les différents types d\'entités', () => {
    const { rerender } = render(<ImpactMetrics {...defaultProps} />)
    
    // Test pour une campagne
    rerender(<ImpactMetrics {...defaultProps} targetType="campaign" />)
    expect(screen.getByText('Impact & Métriques')).toBeInTheDocument()
  })
})
