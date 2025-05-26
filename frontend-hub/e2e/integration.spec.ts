import { test, expect } from '@playwright/test'

test.describe('Tests d\'intégration Hub Central', () => {
  test('Navigation et composants de base', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/Hub Central/)
    
    // Vérifier les éléments de navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByText('Hub Central')).toBeVisible()
    
    // Vérifier la section hero
    await expect(page.locator('h1')).toBeVisible()
  })

  test('Page associations', async ({ page }) => {
    await page.goto('/associations')
    
    // Vérifier que la page associations se charge
    await expect(page.getByText('Associations')).toBeVisible()
    
    // Vérifier la barre de recherche
    await expect(page.locator('input[type="search"]')).toBeVisible()
    
    // Vérifier les filtres
    await expect(page.getByText('Filtres')).toBeVisible()
  })

  test('Navigation vers détail association', async ({ page }) => {
    await page.goto('/associations')
    
    // Cliquer sur une association (si disponible)
    const associationCard = page.locator('[data-testid="association-card"]').first()
    if (await associationCard.count() > 0) {
      await associationCard.click()
      
      // Vérifier la navigation vers la page de détail
      await expect(page).toHaveURL(/\/associations\//)
      
      // Vérifier les composants intégrés sur la page de détail
      await expect(page.getByText('Contenu Similaire')).toBeVisible()
      await expect(page.getByText('Commentaires')).toBeVisible()
      await expect(page.getByText('Métriques')).toBeVisible()
    }
  })

  test('Recherche fonctionnelle', async ({ page }) => {
    await page.goto('/associations')
    
    const searchInput = page.locator('input[type="search"]')
    await searchInput.fill('éducation')
    await searchInput.press('Enter')
    
    // Attendre que les résultats se chargent
    await page.waitForTimeout(1000)
    
    // Vérifier que la recherche fonctionne
    await expect(page).toHaveURL(/search/)
  })

  test('Responsive design', async ({ page }) => {
    // Test sur mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Vérifier que le contenu est visible sur mobile
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
    
    // Test sur tablette
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/associations')
    
    // Vérifier que la mise en page s'adapte
    await expect(page.locator('input[type="search"]')).toBeVisible()
  })
})
