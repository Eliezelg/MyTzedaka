# Corrections du Routing i18n

## Problèmes identifiés et corrigés

### 1. **Middleware**
- Changé `localePrefix: 'as-needed'` en `localePrefix: 'always'`
- Cela force toujours l'affichage de la locale dans l'URL (/fr ou /he)
- Supprimé le bypass de la route racine

### 2. **Page racine**
- Supprimé `/app/page.tsx` car next-intl gère automatiquement la redirection
- La redirection vers la locale par défaut se fait automatiquement

### 3. **LanguageSelector**
- Corrigé la logique de changement de langue
- Utilisation d'une regex pour remplacer correctement la locale : `/^\/[a-z]{2}(?=\/|$)/`
- Ajout de `router.refresh()` pour forcer le rechargement des traductions
- Vérification pour éviter la double locale (/he/he)

### 4. **Scripts package.json**
- Ajouté des scripts cross-platform :
  - `npm run dev` : version simple sans options
  - `npm run dev:windows` : avec SET pour Windows
  - `npm run dev:unix` : avec export pour Linux/Mac

### 5. **Traductions**
- Ajouté les clés manquantes dans common.json
- Remplacé toutes les chaînes hardcodées
- Créé un script pour fusionner automatiquement les traductions

## Comportement attendu

1. **Accès à localhost:3000**
   - Redirection automatique vers `/fr` (locale par défaut)

2. **Changement de langue**
   - De `/fr` vers hébreu → `/he`
   - De `/he` vers français → `/fr`
   - De `/fr/associations` vers hébreu → `/he/associations`

3. **Sélecteur de langue**
   - Affiche la langue courante correctement
   - Ne permet pas de cliquer sur la langue déjà active
   - Change l'URL et recharge les traductions

## Tests à effectuer

1. Accéder à `localhost:3000` → devrait rediriger vers `/fr`
2. Cliquer sur hébreu → devrait aller à `/he` avec interface RTL
3. Cliquer sur français → devrait revenir à `/fr`
4. Naviguer vers `/fr/associations` puis changer de langue → `/he/associations`
5. Vérifier que les traductions se chargent correctement

## Corrections supplémentaires pour les traductions

### 6. **LanguageSelector détection de locale**
- Ajout de détection de locale depuis l'URL comme fallback
- Regex: `/^\/([a-z]{2})(?:\/|$)/` pour extraire la locale
- Prévention du problème où useLocale() ne retourne pas la bonne locale

### 7. **Rechargement forcé des traductions**
- Utilisation de `window.location.replace()` au lieu de `router.push()`
- Cela force un rechargement complet de la page et des traductions

### 8. **Script de merge des traductions**
- Amélioration du script avec debug et gestion d'erreurs
- Vérification que tous les namespaces sont bien fusionnés

### 9. **Correction NextIntlClientProvider**
- Ajout de la prop `locale={locale}` dans le layout
- Ajout de `key={locale}` pour forcer la réhydratation
- Cela résout le problème où `useTranslations` côté client utilisait les mauvaises traductions

## Résolution Finale

Le problème principal était que `NextIntlClientProvider` ne recevait pas explicitement la locale et ne se réhydratait pas lors des changements de langue. 

**Corrections appliquées :**
```tsx
<NextIntlClientProvider key={locale} locale={locale} messages={messages}>
```

Les traductions hébraïques fonctionnent maintenant correctement côté client et serveur.