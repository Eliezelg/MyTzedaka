# Résolution des problèmes de routing i18n avec Next.js 14 et next-intl

## Date : 13 juin 2025

## Problème initial
- Erreur 404 persistante sur la route racine `/`
- Conflits entre le middleware next-intl et la gestion des routes
- Erreurs liées aux imports de `notFound()` dans la configuration i18n

## Solutions appliquées

### 1. Simplification du middleware
```typescript
// src/middleware.ts
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true
});
```

### 2. Correction de la gestion des locales non supportées
- Suppression de l'import `notFound()` dans `i18n.ts`
- Retour de la locale par défaut au lieu de lancer une erreur

### 3. Page racine simplifiée
- Création d'une page statique simple sans hooks de traduction
- Liens directs vers les versions localisées `/fr` et `/he`
- Évite les conflits de contexte next-intl

## Structure finale
```
src/app/
├── page.tsx           # Page racine simple avec liens
├── layout.tsx         # Layout racine minimal
└── [locale]/
    ├── page.tsx       # Pages localisées avec traductions
    └── layout.tsx     # Layout avec providers i18n
```

## Résultat
✅ Route racine `/` fonctionne correctement
✅ Routes localisées `/fr` et `/he` accessibles
✅ Système i18n opérationnel avec support RTL pour l'hébreu
✅ Plus d'erreurs 404 ou 500 sur la navigation

## Points d'attention
- Avec `localePrefix: 'as-needed'`, la locale par défaut (fr) n'a pas de préfixe
- La page racine ne peut pas utiliser directement les hooks de traduction
- Le middleware gère automatiquement la détection de locale pour les routes [locale]
