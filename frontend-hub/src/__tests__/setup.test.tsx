import { render, screen } from '@testing-library/react'

// Test simple pour vérifier que Jest fonctionne
describe('Configuration Jest', () => {
  it('peut rendre un composant React simple', () => {
    const TestComponent = () => <div>Test Réussi</div>
    
    render(<TestComponent />)
    
    expect(screen.getByText('Test Réussi')).toBeInTheDocument()
  })

  it('peut utiliser les matchers jest-dom', () => {
    const TestComponent = () => (
      <button disabled className="test-button">
        Bouton désactivé
      </button>
    )
    
    render(<TestComponent />)
    
    const button = screen.getByText('Bouton désactivé')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveClass('test-button')
  })

  it('peut tester les interactions utilisateur', () => {
    const mockFn = jest.fn()
    const TestComponent = () => (
      <button onClick={mockFn}>
        Cliquer ici
      </button>
    )
    
    render(<TestComponent />)
    
    const button = screen.getByText('Cliquer ici')
    button.click()
    
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
