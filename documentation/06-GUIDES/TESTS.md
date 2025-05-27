# 🧪 Guide de Tests pour MyTzedaka

## 📋 Stratégie Globale de Tests

Ce document définit l'approche et les pratiques de tests pour garantir la qualité et la fiabilité de MyTzedaka à travers toutes les phases de développement.

### Pyramide de Tests
Notre stratégie suit la pyramide de tests classique :
- **Base (nombreux)** : Tests unitaires
- **Milieu (moyens)** : Tests d'intégration
- **Sommet (peu)** : Tests end-to-end

### Environnements de Test
- **Développement** : Tests locaux sur machine dev
- **CI/CD** : Tests automatisés à chaque commit/PR
- **Staging** : Environnement miroir de production
- **Production** : Tests smoke après déploiement

## 🧩 Types de Tests

### Tests Unitaires

```typescript
// Exemple de test unitaire pour un service
describe('CampaignService', () => {
  it('devrait calculer correctement le pourcentage de progression', () => {
    const campaign = {
      goal: 10000,
      raised: 2500
    };
    
    expect(calculateProgressPercentage(campaign)).toBe(25);
  });
});
```

#### Outils
- **Backend** : Jest
- **Frontend** : React Testing Library + Jest
- **Coverage** : Minimum 80% de couverture

#### Commandes
```bash
# Backend
cd backend
npm run test:unit

# Frontend
cd frontend-hub
npm run test:unit
```

### Tests d'Intégration

```typescript
// Exemple de test d'intégration pour une API
describe('API Campaigns', () => {
  it('devrait retourner les détails d'une campagne', async () => {
    const response = await request(app)
      .get('/api/hub/campaigns/campaign-test-1')
      .set('Authorization', `Bearer ${testToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Rénovation de la synagogue');
    expect(response.body.progressPercentage).toBe(25);
  });
});
```

#### Outils
- **Backend** : Supertest + Jest
- **API** : Postman Collections
- **BDD** : Cucumber (pour scénarios métier)

#### Commandes
```bash
# Tests d'intégration backend
cd backend
npm run test:integration

# Tests API avec Newman
cd tests
newman run MyTzedaka.postman_collection.json -e Production.postman_environment.json
```

### Tests End-to-End (E2E)

```typescript
// Exemple de test E2E avec Playwright
test('Un utilisateur peut faire un don à une campagne', async ({ page }) => {
  // Étape 1: Naviguer vers la page campagne
  await page.goto('/campaigns/campaign-test-1');
  
  // Étape 2: Sélectionner un montant de don
  await page.click('button:has-text("50€")');
  
  // Étape 3: Cliquer sur le bouton faire un don
  await page.click('button:has-text("Faire un don")');
  
  // Étape 4: Vérifier redirection vers page paiement
  expect(page.url()).toContain('/checkout');
  
  // Étape 5: Remplir formulaire carte de test
  await page.fill('[data-testid="card-number"]', '4242424242424242');
  await page.fill('[data-testid="card-expiry"]', '12/25');
  await page.fill('[data-testid="card-cvc"]', '123');
  
  // Étape 6: Confirmer le paiement
  await page.click('button:has-text("Confirmer")');
  
  // Étape 7: Vérifier page de succès
  await page.waitForURL('**/success**');
  expect(await page.textContent('h1')).toContain('Merci pour votre don');
});
```

#### Outils
- **Framework** : Playwright
- **Visual Testing** : Percy
- **Analytics** : Amplitude/Mixpanel

#### Commandes
```bash
# Lancer les tests E2E
cd tests/e2e
npx playwright test

# Lancer avec interface visuelle
npx playwright test --ui
```

## 🛠️ Tests Spécifiques

### Tests de Performance

#### Objectifs
- **Temps de chargement** : < 2s (LCP)
- **TTI** : < 3.5s (Time to Interactive)
- **Bundle size** : < 200KB (initial load)
- **API Response** : < 300ms (P95)

#### Outils
- **Lighthouse** : Audit performances web
- **WebPageTest** : Tests multi-région
- **k6** : Tests charge API

#### Commandes
```bash
# Tests de charge API
k6 run performance/api-load-test.js

# Audit Lighthouse
npx lighthouse https://mytzedaka.com --output=json --output-path=./lighthouse-report.json
```

### Tests d'Accessibilité

#### Standards
- WCAG 2.1 niveau AA
- Support lecteurs d'écran
- Navigation clavier complète

#### Outils
- **axe-core** : Tests automatisés
- **Pa11y** : CI integration
- **Tests manuels** : NVDA, VoiceOver

#### Commandes
```bash
# Vérification accessibilité
cd frontend-hub
npm run test:a11y
```

### Tests de Sécurité

#### Objectifs
- Protection XSS, CSRF, injections
- Sécurisation des API
- Validation entrées utilisateur
- Prévention fuite données

#### Outils
- **OWASP ZAP** : Scan vulnérabilités
- **npm audit** : Audit dépendances
- **SonarQube** : Analyse code

#### Commandes
```bash
# Audit sécurité
npm audit
# Scan OWASP
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://mytzedaka.com
```

## 📊 Métriques et Rapports

### Métriques Clés
- **Couverture** : % code couvert par tests
- **Taux réussite** : % tests passants
- **Temps exécution** : Durée totale suite tests
- **Défauts trouvés** : Bugs par sprint/release

### Rapports Automatisés
- Rapports JUnit pour CI/CD
- Rapports HTML pour équipe
- Alertes Slack pour échecs
- Dashboard metrics dans DataDog

## 🔄 Intégration Continue

### Workflow GitHub Actions
```yaml
name: Tests CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Gestion Qualité
- Bloqué merge si tests échouent
- Review code obligatoire
- Seuils qualité SonarQube
- Vérification coverage avant merge

## 📝 Bonnes Pratiques

### Pour les Développeurs
- Écrire tests avant code (TDD quand possible)
- Tests unitaires pour chaque nouvelle fonction
- Mocker dépendances externes
- Tester cas limites et exceptions

### Pour les QA
- Maintenir collection tests Postman à jour
- Tests manuels exploratoires chaque sprint
- Sessions pair testing avec devs
- Documenter cas de test dans TestRail

## 🚀 Checklist Release

Avant chaque mise en production :

- [ ] Tous les tests unitaires passent
- [ ] Tests d'intégration validés
- [ ] Tests E2E principaux confirmés
- [ ] Tests de régression exécutés
- [ ] Tests de performance validés
- [ ] Audit accessibilité OK
- [ ] Scan sécurité sans vulnérabilité critique

---

*Document créé le 27 mai 2025*  
*Dernière mise à jour : 27 mai 2025*
