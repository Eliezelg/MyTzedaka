# 🧪 Phase 7 Sprint 2 - Tests Manuels

**Date** : 27 mai 2025  
**Environnement** : 
- Backend API: http://localhost:3000
- Frontend: http://localhost:3003  
- Browser Preview: http://127.0.0.1:27420

## 📋 Tests Utilisateurs - Session 1

### Test 1: Navigation Homepage → Page Campagne
**Objectif** : Valider le parcours utilisateur complet
**Durée** : 5 minutes

#### Étapes
1. [ ] Accéder à la homepage `http://localhost:3003`
2. [ ] Identifier les campagnes affichées
3. [ ] Cliquer sur une campagne (ex: "Rénovation synagogue")
4. [ ] Vérifier redirection vers `/campaigns/[id]`
5. [ ] Valider affichage des données campagne

#### Critères de Succès
- [ ] Navigation fluide (< 2 secondes)
- [ ] Données campagne complètes affichées
- [ ] Images chargées correctement
- [ ] Breadcrumbs fonctionnels

### Test 2: Page Détail Campagne - UX Globale
**Objectif** : Évaluer l'expérience utilisateur complète
**URL** : `http://localhost:3003/campaigns/campaign-test-1`

#### Sections à Valider
- [ ] **Header/Hero** : Titre, image, objectif clairement visibles
- [ ] **Barre de progression** : Pourcentage, montant levé/objectif
- [ ] **Statistiques** : Nombre donateurs, moyenne, jours restants
- [ ] **Description** : Texte lisible, formatage correct
- [ ] **Widget donation** : Visible et accessible
- [ ] **Partage social** : Boutons présents et fonctionnels

#### User Journey
1. [ ] Lecture description campagne (~ 30 secondes)
2. [ ] Consultation statistiques (~ 15 secondes) 
3. [ ] Interaction widget donation (~ 45 secondes)
4. [ ] Test partage social (~ 30 secondes)

### Test 3: Widget Donation - Fonctionnalités
**Objectif** : Valider toutes les interactions du widget
**Focus** : UX donation avant intégration Stripe

#### Tests Montants Suggérés
- [ ] **25€** : Sélection, highlight visuel
- [ ] **50€** : Sélection, changement état
- [ ] **100€** : Sélection, feedback utilisateur
- [ ] **250€** : Sélection, confirmation visuelle

#### Test Montant Personnalisé
1. [ ] Clic sur "Autre montant"
2. [ ] Saisie montant valide (ex: 75€)
3. [ ] Validation format (pas de caractères invalides)
4. [ ] Feedback visuel état actif

#### Validation Formulaire
- [ ] **Champs obligatoires** : Indication claire
- [ ] **Format email** : Validation côté client
- [ ] **Messages erreur** : Clairs et utiles
- [ ] **État loading** : Feedback pendant traitement

### Test 4: Responsive Design
**Objectif** : Valider l'adaptation mobile/tablet/desktop

#### Mobile (375px - iPhone 12)
- [ ] **Navigation** : Menu hamburger fonctionnel
- [ ] **Hero section** : Image et texte lisibles
- [ ] **Widget donation** : Utilisable au doigt
- [ ] **Boutons** : Taille touch-friendly (44px min)
- [ ] **Texte** : Lisible sans zoom
- [ ] **Scroll** : Fluide, pas de débordement horizontal

#### Tablet (768px - iPad)
- [ ] **Layout** : Adaptation intelligente
- [ ] **Images** : Ratio conservé
- [ ] **Navigation** : Accessible et intuitive
- [ ] **Widget** : Taille appropriée

#### Desktop (1200px+)
- [ ] **Centrage contenu** : Largeur maximale respectée
- [ ] **Sidebar** : Informations complémentaires
- [ ] **Hover states** : Feedback visuel sur boutons/liens

## 🚀 Tests Performance

### Test 5: Lighthouse Audit
**Objectif** : Mesurer les Core Web Vitals

#### Métriques à Atteindre
- [ ] **Performance** : ≥ 95/100
- [ ] **Accessibility** : 100/100
- [ ] **Best Practices** : ≥ 95/100
- [ ] **SEO** : 100/100

#### Core Web Vitals
- [ ] **LCP** (Largest Contentful Paint) : < 2.5s
- [ ] **FID** (First Input Delay) : < 100ms
- [ ] **CLS** (Cumulative Layout Shift) : < 0.1

#### Instructions Test
1. Ouvrir DevTools (F12)
2. Onglet "Lighthouse"
3. Sélectionner "Performance, Accessibility, Best Practices, SEO"
4. Mode "Desktop" puis "Mobile"
5. Cliquer "Generate report"

### Test 6: Network Performance
**Objectif** : Analyser les requêtes réseau

#### Métriques API
- [ ] **GET /api/hub/campaigns/campaign-test-1** : < 200ms
- [ ] **Images** : Optimisation WebP/compression
- [ ] **JS Bundle** : < 500kb total
- [ ] **CSS** : < 50kb

#### Cache Validation
- [ ] **React Query** : Pas de requêtes inutiles
- [ ] **Images** : Cache browser actif
- [ ] **Static assets** : Headers cache appropriés

## ♿ Tests Accessibilité

### Test 7: Navigation Clavier
**Objectif** : Validation complète keyboard-only

#### Parcours Clavier
1. [ ] **Tab** : Ordre logique de navigation
2. [ ] **Enter/Space** : Activation boutons/liens
3. [ ] **Escape** : Fermeture modals/menus
4. [ ] **Arrow keys** : Navigation dans widgets complexes

#### Focus Management
- [ ] **Outline visible** : Focus clairement identifiable
- [ ] **Skip links** : Navigation rapide au contenu
- [ ] **Focus trap** : Dans modals/overlays
- [ ] **Return focus** : Après fermeture modal

### Test 8: Screen Reader (NVDA/JAWS)
**Objectif** : Validation lecture écran

#### Éléments à Tester
- [ ] **Headings** : Structure H1→H6 logique
- [ ] **Images** : Alt text descriptif
- [ ] **Forms** : Labels associés correctement
- [ ] **Buttons** : Description action claire
- [ ] **Links** : Contexte compréhensible

#### Navigation ARIA
- [ ] **Landmarks** : Régions identifiées
- [ ] **Live regions** : Updates annoncées
- [ ] **States** : expanded/selected annoncés
- [ ] **Descriptions** : aria-describedby utilisé

### Test 9: Contraste Couleurs
**Objectif** : Validation WCAG 2.1 AA (4.5:1)

#### Éléments à Vérifier
- [ ] **Texte principal** : Contraste suffisant
- [ ] **Boutons** : État normal et hover
- [ ] **Links** : Distinguables du texte
- [ ] **Form inputs** : Bordures et labels
- [ ] **Error messages** : Lisibles clairement

## 📊 Métriques à Collecter

### Performance
```
Page Load Time: _____ ms
API Response Time: _____ ms
Bundle Size Total: _____ kb
Images Total Size: _____ kb
```

### User Experience
```
Task Completion Rate: _____%
Average Time on Page: _____ min
Bounce Rate: _____%
Error Encounters: _____ instances
```

### Accessibility
```
Lighthouse A11y Score: _____/100
Keyboard Navigation: Pass/Fail
Screen Reader: Pass/Fail
Color Contrast: Pass/Fail
```

## 📝 Template Rapport Bug

```markdown
**Bug ID**: SPRINT2-BUG-XXX
**Date**: 27/05/2025
**Testeur**: [Nom]
**Environnement**: [Browser/Device]

**Titre**: [Description courte]

**Étapes pour reproduire**:
1. 
2. 
3. 

**Résultat attendu**:
[Description]

**Résultat observé**:
[Description]

**Priorité**: Critique/Élevée/Moyenne/Faible
**Impact**: Bloquant/Majeur/Mineur/Cosmétique

**Screenshots**: [Si applicable]
```

## ✅ Validation Finale

### Critères Go/No-Go Phase 8
- [ ] **Performance** : Lighthouse ≥ 95
- [ ] **Accessibility** : 100% conforme WCAG 2.1 AA
- [ ] **User Testing** : ≥ 90% satisfaction
- [ ] **Zero Critical Bugs** : Aucun bug bloquant
- [ ] **Mobile Ready** : 100% fonctionnel mobile

### Signature Validation
- [ ] **Tech Lead** : Validation technique ✅
- [ ] **UX Lead** : Validation expérience ✅  
- [ ] **Product Owner** : Validation fonctionnelle ✅
- [ ] **QA Lead** : Validation qualité ✅

---

**Prochaine étape** : Rapport de validation et Go/No-Go pour Phase 8
