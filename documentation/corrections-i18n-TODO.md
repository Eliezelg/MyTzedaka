# 📋 TODO Liste - Corrections i18n 

## ✅ État Final - Internationalisation Complète à 95%

### Résumé du travail accompli ✅
L'internationalisation est maintenant **pleinement fonctionnelle** :
- ✅ Header et footer avec traductions complètes
- ✅ Changement de langue instantané FR/HE
- ✅ Support RTL natif pour l'hébreu
- ✅ Toutes les pages principales traduites
- ✅ Navigation avec préfixes de locale (/fr, /he)

## ✅ Travail Complété par Priorité

### **PRIORITÉ 1 - TERMINÉE** ✅ 

#### 1. **Page d'accueil** - `/app/[locale]/page.tsx` ✅
- ✅ Ajout de `useTranslations('index')` et `useTranslations('common')`
- ✅ Tous les textes hardcodés remplacés par des traductions
- ✅ Utilise : `index.hero.*`, `index.stats.*`, `index.featured.*`, `index.cta.*`

#### 2. **Hero Section** - `/components/hub/hero-section.tsx` ✅
- ✅ Ajout `'use client'` + `useTranslations('index')`
- ✅ Badge, titre, sous-titre, statistiques traduits

#### 3. **Association Card** - `/components/hub/association-card.tsx` ✅
- ✅ Ajout `'use client'` + `useTranslations('associations')`
- ✅ Badge vérifiée, métriques, boutons traduits

#### 4. **Campaign Card** - `/components/hub/campaign-card.tsx` ✅
- ✅ Ajout `'use client'` + `useTranslations('campaigns')`
- ✅ Statuts, progression, actions traduites

### **PRIORITÉ 2 - TERMINÉE** ✅

#### 5. **Page Associations** - `/app/[locale]/associations/page.tsx` ✅
- ✅ Ajout `useTranslations('associations')`
- ✅ Titre, description, filtres traduits

#### 6. **Page Campaigns** - `/app/[locale]/campaigns/page.tsx` ✅
- ✅ Ajout `useTranslations('campaigns')`
- ✅ Titre, sous-titre, statuts traduits

#### 7. **Filter Panel** - `/components/hub/filter-panel.tsx` ✅
- ✅ Ajout `useTranslations('search')`
- ✅ Tous les filtres et options traduits

### **PRIORITÉ 3 - TERMINÉE** ✅

#### 8. **Page Search** - `/app/[locale]/search/page.tsx` ✅
- ✅ Ajout `useTranslations('search')`
- ✅ Interface de recherche complètement traduite
- ✅ Filtres, tri, résultats, actions traduites

#### 9. **Pages Auth** ✅
- ✅ **Login** (`/app/[locale]/login/page.tsx`) - Complètement traduite
- ✅ **Signup** (`/app/[locale]/signup/page.tsx`) - Complètement traduite avec étapes
- ✅ Messages d'erreur et validation traduits

## 🟡 Composants Restants (Non Prioritaires)

### **Composants Optionnels** (5% restants pour i18n 100%)

#### 10. **Composants Donation**
- `DonationWidget.tsx`, `DonationForm.tsx`
- État: Fonctionnels mais pas traduits
- Impact: Mineur - utilisés après connexion

#### 11. **Composants Hub Secondaires**
- `comment-system.tsx` - Système de commentaires
- `impact-metrics.tsx` - Métriques d'impact
- `media-gallery.tsx` - Galerie média
- `related-content.tsx` - Contenu connexe
- `social-share.tsx` - Partage social
- État: Textes hardcodés en français

#### 12. **Composants Dashboard**
- Pages du tableau de bord
- État: Non prioritaire - zone admin

## 🛠 Procédure Standard pour Chaque Composant

### 1. **Vérifier le type de composant**
```tsx
// Si le composant utilise hooks/state/events → ajouter
'use client'
```

### 2. **Ajouter les imports**
```tsx
import { useTranslations } from 'next-intl'
```

### 3. **Ajouter le hook dans le composant**
```tsx
const t = useTranslations('namespace') // associations, campaigns, common, index, search
```

### 4. **Remplacer le texte hardcodé**
```tsx
// Avant
<h1>Associations en vedette</h1>

// Après  
<h1>{t('featured.title')}</h1>
```

### 5. **Vérifier les clés**
- Les clés existent déjà dans les fichiers JSON fr/he
- Si nouvelle clé nécessaire → ajouter aux JSON puis relancer le script merge

## 📊 Estimation Totale

- **Priorité 1**: ~1h25 (4 composants critiques)
- **Priorité 2**: ~1h20 (3 pages principales)  
- **Priorité 3**: ~2h00 (fonctionnalités secondaires)

**Total estimé**: ~4h45 pour une internationalisation complète

## 🎯 Objectif

Une fois tous ces composants corrigés, l'application sera **100% internationale** avec:
- Tous les textes traduits français ↔ hébreu
- Interface RTL complète pour l'hébreu
- Changement de langue fluide sans rechargement
- Expérience utilisateur native dans les deux langues

## 📝 Notes importantes

- **Tester chaque composant** après modification
- **Vérifier le changement de langue** fonctionne
- **Ne pas oublier** de régénérer index.json si nouvelles clés ajoutées
- **Prioriser les composants visibles** (page d'accueil, cards) en premier