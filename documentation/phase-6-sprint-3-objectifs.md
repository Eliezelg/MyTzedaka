# Phase 6 Sprint 3 - API Campagnes et Pages Dynamiques

## 🎯 OBJECTIFS SPRINT 3

### 1. API Backend - Extensions Hub Central
- [ ] Endpoint `/api/hub/campaigns` avec filtres
- [ ] Endpoint `/api/hub/associations/{id}` pour détails  
- [ ] Endpoint `/api/hub/campaigns/{id}` pour détails
- [ ] Relations Association ↔ Campagnes dans Prisma
- [ ] Données de test enrichies (3-4 campagnes par association)

### 2. Frontend - Pages Dynamiques
- [ ] Page `/associations/[id]` - Détail association complète
- [ ] Page `/campaigns/[id]` - Détail campagne avec progression
- [ ] Page `/search` - Recherche unifiée avec filtres
- [ ] Navigation entre pages (breadcrumbs, liens)

### 3. Composants Avancés
- [ ] `AssociationHero` - Section hero avec stats/image
- [ ] `CampaignHero` - Hero campagne avec progression
- [ ] `DonationWidget` - Widget donation (mock pour l'instant)
- [ ] `ProgressTracker` - Barre progression animée
- [ ] `MediaGallery` - Galerie photos/vidéos
- [ ] `RelatedItems` - Suggestions associations/campagnes

### 4. État et Navigation
- [ ] Hooks `useAssociation(id)` et `useCampaign(id)`
- [ ] Navigation contextuelle (retour, suivant/précédent)
- [ ] Partage social (liens, méta tags)
- [ ] SEO optimisé (metadata dynamique)

## 📋 TÂCHES PRIORITAIRES

### Backend (Étape 1)
1. **Modèle Campagne Prisma**
   ```prisma
   model Campaign {
     id          String   @id @default(cuid())
     title       String
     description String
     goal        Float
     raised      Float    @default(0)
     // ... autres champs
   }
   ```

2. **Services Hub étendus**
   - `getCampaigns(filters)`
   - `getAssociationById(id)`  
   - `getCampaignById(id)`

3. **Endpoints API**
   - GET `/api/hub/campaigns?associationId=...`
   - GET `/api/hub/associations/{id}`
   - GET `/api/hub/campaigns/{id}`

### Frontend (Étape 2)
1. **Pages dynamiques**
   - `src/app/associations/[id]/page.tsx`
   - `src/app/campaigns/[id]/page.tsx`
   - `src/app/search/page.tsx`

2. **Hooks API**
   - `useAssociation(id)` avec React Query
   - `useCampaign(id)` avec React Query
   - `useCampaigns(filters)` étendu

3. **Composants Hero**
   - Design moderne avec gradients
   - Stats en temps réel
   - Boutons d'action principaux

## 🎨 DESIGN PATTERNS

### Association Page Layout
```
[AssociationHero]
├── Image + Logo  
├── Titre + Badges
├── Stats (Total collecté, Nb campagnes)
└── Actions (Suivre, Partager, Donner)

[TabNavigation]
├── Aperçu
├── Campagnes (3-4 items)
├── Impact & Métriques  
└── À propos

[RelatedAssociations]
```

### Campaign Page Layout  
```
[CampaignHero]
├── Image principale
├── Titre + Association parent
├── ProgressTracker animé
└── DonationWidget

[CampaignDetails]
├── Description riche
├── MediaGallery
├── Updates timeline
└── Commentaires donateurs

[RelatedCampaigns]
```

## 🔧 SPÉCIFICATIONS TECHNIQUES

### Types TypeScript
```typescript
interface AssociationDetail extends Association {
  campaigns: Campaign[]
  metrics: {
    totalDonors: number
    avgDonation: number
    impactStories: number
  }
}

interface Campaign {
  id: string
  title: string
  goal: number
  raised: number
  progress: number // calculé
  association: Association
  // ...
}
```

### URL Patterns
- `/associations/[id]` - Page détail association
- `/campaigns/[id]` - Page détail campagne  
- `/search?q=...&type=...&city=...` - Recherche avec filtres
- `/associations/[id]/campaigns` - Campagnes d'une association

## 📊 DONNÉES DE TEST ÉTENDUES

### Campagnes Kehilat Paris
1. "Aide alimentaire familles en difficulté" (Objectif: 15,000€, Collecté: 12,500€)
2. "Soutien scolaire enfants défavorisés" (Objectif: 8,000€, Collecté: 6,200€)
3. "Logement d'urgence hiver 2025" (Objectif: 25,000€, Collecté: 18,900€)

### Campagnes Shalom Marseille  
1. "Centre communautaire rénové" (Objectif: 50,000€, Collecté: 35,600€)
2. "Aide aux personnes âgées isolées" (Objectif: 12,000€, Collecté: 8,900€)

## ⏱️ ESTIMATION DURÉE

- **Backend Extensions** : 4-6 heures
- **Pages Dynamiques** : 6-8 heures  
- **Composants Avancés** : 4-6 heures
- **Tests & Polish** : 2-3 heures

**Total estimé : 16-23 heures** (2-3 sessions de développement)

## 🚀 CRITÈRES DE SUCCÈS

- [ ] 5+ campagnes affichées avec vraies données
- [ ] Navigation fluide entre pages  
- [ ] Pages détail responsive et attractives
- [ ] Widgets donation mockés mais fonctionnels
- [ ] Recherche avec filtres opérationnels
- [ ] SEO et partage social configurés
- [ ] Performance acceptable (< 2s chargement)
- [ ] Tests E2E pages principales

**Objectif : Hub Central pleinement navigable avec expérience utilisateur complète**
