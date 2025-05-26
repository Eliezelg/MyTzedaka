// Test vraiment basique sans React pour vérifier Jest
describe('Test de base Jest', () => {
  it('devrait fonctionner', () => {
    expect(1 + 1).toBe(2)
  })

  it('devrait pouvoir utiliser les mocks', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})
