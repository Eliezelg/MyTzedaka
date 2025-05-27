# Phase 7 : Développement Pages Détail Campagne

## 🎯 Objectifs

**Créer des pages détail campagne complètes et interactives qui connectent le frontend au backend API**

### 📋 Sprint 1 : Pages Détail Campagne (13 jours)

#### 🎨 Page Détail Campagne Principale (`/campaigns/[id]`)

**Composants à créer :**
1. **CampaignHero** - Hero section avec image, titre, description
2. **ProgressTracker** - Barre de progression avec montant collecté/objectif
3. **DonationWidget** - Widget donation avec montants suggérés
4. **SocialShare** - Boutons partage réseaux sociaux
5. **CampaignTimeline** - Historique et updates de la campagne

**Fonctionnalités :**
- ✅ **Données réelles** : Intégration complète avec `/api/hub/campaigns/:id`
- ✅ **Calculs dynamiques** : Pourcentage progression, jours restants
- ✅ **Widget donation** : Montants prédéfinis + saisie personnalisée
- ✅ **Partage social** : URLs spécifiques par campagne
- ✅ **Responsive design** : Mobile-first avec animations

#### 🏗️ Architecture Technique

**Pages à créer :**
```
frontend-hub/src/app/campaigns/[id]/
├── page.tsx              # Page principale détail campagne
├── loading.tsx           # Skeleton de chargement
└── not-found.tsx         # Page campagne non trouvée
```

**Composants UI :**
```
components/campaign/
├── CampaignHero.tsx      # Hero section avec visuel principal
├── ProgressTracker.tsx   # Barre progression + métriques
├── DonationWidget.tsx    # Interface de donation
├── SocialShare.tsx       # Boutons partage social
├── CampaignTimeline.tsx  # Historique updates
└── RelatedCampaigns.tsx  # Campagnes similaires
```

**Hooks personnalisés :**
```
hooks/
├── useCampaign.ts        # Récupération détail campagne
├── useDonation.ts        # Gestion processus donation
└── useCampaignStats.ts   # Statistiques en temps réel
```

#### 🔌 Intégration API

**Endpoints backend utilisés :**
- `GET /api/hub/campaigns/:id` - Détails complets campagne
- `GET /api/hub/campaigns/:id/donations` - Historique donations
- `POST /api/hub/donations` - Nouvelle donation
- `GET /api/hub/campaigns/related/:id` - Campagnes similaires

**Types TypeScript :**
- `CampaignDetail` - Campagne avec relations
- `DonationRequest` - Payload nouvelle donation
- `CampaignStats` - Métriques temps réel

#### 🎨 Design & UX

**Hero Section :**
- Image cover full-width responsive
- Overlay avec titre + description courte
- Badges : urgent, vérifié, catégorie
- CTA donation prominente

**Section Progression :**
- Barre progression animée
- Métriques : collecté/objectif, pourcentage, jours restants
- Historique donations récentes

**Widget Donation :**
- Montants suggérés (18€, 36€, 54€, 100€)
- Saisie personnalisée avec validation
- Support multi-devises (EUR par défaut)
- Bouton CTA avec loading states

**Partage Social :**
- Facebook, Twitter, LinkedIn, WhatsApp
- URLs pré-formatées avec métadonnées
- Textes par défaut customisables

#### 📱 Responsive & Performance

**Mobile-First :**
- Hero adaptatif avec image optimisée
- Widget donation tactile friendly
- Navigation sticky avec CTA donation

**Performance :**
- Images lazy loading + WebP
- Preload des campagnes reliées
- Cache React Query pour données

**SEO :**
- Métadonnées dynamiques par campagne
- Open Graph pour partage social
- JSON-LD pour rich snippets

## 📊 Critères de Succès

### ✅ Fonctionnel
- [ ] Page campagne charge en < 2s
- [ ] Widget donation 100% fonctionnel
- [ ] Données temps réel synchronisées
- [ ] Partage social opérationnel
- [ ] Responsive mobile parfait

### ✅ Technique  
- [ ] 0 erreur TypeScript
- [ ] Build production réussi
- [ ] Tests composants passants
- [ ] API endpoints intégrés
- [ ] Cache optimisé

### ✅ UX/UI
- [ ] Design moderne et cohérent
- [ ] Animations fluides
- [ ] Loading states élégants
- [ ] Messages erreur explicites
- [ ] CTA donation visible

## 🚀 Plan d'Exécution

### Jour 1-2 : Architecture de base
- [ ] Structure pages `/campaigns/[id]`
- [ ] Hook `useCampaign` avec cache
- [ ] Types TypeScript complets
- [ ] Tests API endpoints

### Jour 3-5 : Composants core
- [ ] `CampaignHero` avec responsive
- [ ] `ProgressTracker` avec animations
- [ ] `DonationWidget` interface complète
- [ ] Integration données réelles

### Jour 6-8 : Fonctionnalités avancées  
- [ ] `SocialShare` avec métadonnées
- [ ] `CampaignTimeline` historique
- [ ] `RelatedCampaigns` suggestions
- [ ] SEO et performances

### Jour 9-11 : Polish & optimisation
- [ ] Tests utilisateur complets
- [ ] Optimisation performances
- [ ] A/B test widget donation
- [ ] Documentation composants

### Jour 12-13 : Validation & déploiement
- [ ] Tests e2e complets
- [ ] Validation cross-browser
- [ ] Métriques performance
- [ ] Préparation Phase 8

## 🔮 Vision Post-Phase 7

Après cette phase, nous aurons :
- **Pages campagne** complètement fonctionnelles
- **Widget donation** intégré au backend
- **UX moderne** avec partage social
- **Performance optimisée** pour la production

**Prochaine Phase 8** : Système de Donations Complet avec paiement Stripe, tableaux de bord donateur, et analytics avancées.
