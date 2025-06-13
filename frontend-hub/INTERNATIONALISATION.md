# 🌍 Documentation Internationalisation (i18n)

## 📋 Vue d'ensemble

L'internationalisation a été implémentée avec **next-intl** pour supporter le français et l'hébreu.

### Langues supportées
- 🇫🇷 **Français** (fr) - Langue par défaut
- 🇮🇱 **Hébreu** (he) - Support RTL complet

## 🏗️ Architecture

### Structure des fichiers
```
messages/
├── fr/
│   ├── index.json          # Fichier principal (combiné)
│   ├── common.json         # Éléments communs
│   ├── navigation.json     # Navigation et menus
│   ├── forms.json          # Formulaires et validation
│   ├── associations.json   # Gestion des associations
│   ├── campaigns.json      # Gestion des campagnes
│   ├── donations.json      # Système de dons
│   ├── auth.json          # Authentification
│   ├── dashboard.json     # Tableau de bord
│   └── errors.json        # Messages d'erreur
└── he/
    ├── index.json          # Fichier principal (combiné)
    ├── common.json         # [mêmes catégories qu'en français]
    └── ...
```

### Configuration
- **next.config.js** : Plugin next-intl configuré
- **src/i18n.ts** : Configuration principale des locales
- **src/middleware.ts** : Routing et authentification multi-langue
- **src/app/[locale]/layout.tsx** : Layout principal avec support RTL

## 🚀 Utilisation

### 1. Hook de base
```tsx
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('common')
  return <h1>{t('welcome')}</h1>
}
```

### 2. Hooks spécialisés
```tsx
import { 
  useCommonTranslations, 
  useNavigationTranslations,
  useFormTranslations 
} from '@/lib/translations'

function MyComponent() {
  const tCommon = useCommonTranslations()
  const tNav = useNavigationTranslations()
  const tForm = useFormTranslations()
  
  return (
    <div>
      <h1>{tCommon('welcome')}</h1>
      <nav>{tNav('home')}</nav>
      <button>{tForm('buttons.submit')}</button>
    </div>
  )
}
```

### 3. Composants utilitaires
```tsx
import { 
  CommonText, 
  NavigationText, 
  FormText,
  TranslatedText 
} from '@/components/ui/translated-text'

function MyComponent() {
  return (
    <div>
      <CommonText tKey="welcome" as="h1" />
      <NavigationText tKey="home" />
      <FormText tKey="buttons.submit" />
      <TranslatedText 
        namespace="campaigns" 
        tKey="progress.funded" 
        values={{ percent: 75 }} 
      />
    </div>
  )
}
```

### 4. Traductions côté serveur
```tsx
import { getTranslations } from 'next-intl/server'

export default async function ServerComponent({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  const t = await getTranslations({ locale, namespace: 'common' })
  
  return <h1>{t('welcome')}</h1>
}
```

## 🌐 Routing

### Structure des URLs
- Français : `/fr/...` ou `/...` (par défaut)
- Hébreu : `/he/...`

### Exemples
- `/` ou `/fr` → Page d'accueil français
- `/he` → Page d'accueil hébreu
- `/fr/associations` → Liste associations français
- `/he/associations` → Liste associations hébreu

### Navigation programmatique
```tsx
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const switchLanguage = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <button onClick={() => switchLanguage('he')}>
      Switch to Hebrew
    </button>
  )
}
```

## 🎨 Support RTL (Hébreu)

### Layout automatique
Le layout détecte automatiquement la direction :
```tsx
<html 
  lang={locale} 
  dir={locale === 'he' ? 'rtl' : 'ltr'}
>
```

### Styles Tailwind
Les classes Tailwind s'adaptent automatiquement :
```tsx
// S'adapte automatiquement en RTL
<div className="ml-4 text-left">
  {/* Devient mr-4 text-right en hébreu */}
</div>

// Forcer une direction si nécessaire
<div className="ltr:ml-4 rtl:mr-4">
  {/* Contrôle explicite */}
</div>
```

## 💱 Formatage locale-aware

### Devises
```tsx
import { formatCurrency } from '@/lib/translations'

// Français : 100,00 €
// Hébreu : ₪100.00
const price = formatCurrency(100, 'EUR', locale)
```

### Dates
```tsx
import { formatDate } from '@/lib/translations'

// Français : 13 juin 2025
// Hébreu : 13 ביוני 2025
const date = formatDate(new Date(), locale)
```

### Nombres
```tsx
import { formatNumber } from '@/lib/translations'

// Français : 1 234,56
// Hébreu : 1,234.56
const number = formatNumber(1234.56, locale)
```

## 🔧 Sélecteur de langue

### Composant intégré
```tsx
import { LanguageSelector } from '@/components/ui/language-selector'

function Header() {
  return (
    <header>
      {/* Autres éléments */}
      <LanguageSelector />
    </header>
  )
}
```

## 📝 Ajout de nouvelles traductions

### 1. Ajouter les clés en français
```json
// messages/fr/common.json
{
  "newFeature": {
    "title": "Nouvelle fonctionnalité",
    "description": "Description de la fonctionnalité"
  }
}
```

### 2. Ajouter les traductions en hébreu
```json
// messages/he/common.json
{
  "newFeature": {
    "title": "תכונה חדשה",
    "description": "תיאור התכונה"
  }
}
```

### 3. Mettre à jour les fichiers index.json
Les fichiers `index.json` combinent toutes les catégories et doivent être mis à jour.

### 4. Utiliser dans le code
```tsx
const t = useCommonTranslations()
return <h2>{t('newFeature.title')}</h2>
```

## 🧪 Tests

### Tester les traductions
```tsx
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

const messages = {
  common: { welcome: 'Welcome' }
}

function renderWithIntl(component) {
  return render(
    <NextIntlClientProvider messages={messages} locale="en">
      {component}
    </NextIntlClientProvider>
  )
}
```

## 🚨 Bonnes pratiques

### 1. Organisation des clés
- Utiliser des namespaces clairs (`common`, `forms`, etc.)
- Grouper par fonctionnalité
- Éviter les clés trop longues

### 2. Valeurs dynamiques
```tsx
// ✅ Bon
t('campaign.progress.funded', { percent: 75 })

// ❌ Éviter
t('campaign.progress') + ' ' + percent + '%'
```

### 3. Fallbacks
```tsx
// Toujours prévoir un fallback
<TranslatedText 
  namespace="common" 
  tKey="unknownKey" 
  fallback="Default text" 
/>
```

### 4. Performance
- Les traductions sont chargées au niveau page
- Utiliser React.memo pour les composants avec beaucoup de traductions
- Éviter les re-renders inutiles

## 🔍 Débogage

### Variables d'environnement de debug
```bash
# Dans .env.local
NEXT_INTL_DEBUG=true
```

### Console warnings
Les clés manquantes sont automatiquement loggées en console.

### Outils de développement
- React DevTools : voir les props de NextIntlClientProvider
- Network tab : vérifier le chargement des messages

## 📚 Ressources

- [Documentation next-intl](https://next-intl-docs.vercel.app/)
- [Support RTL dans Tailwind](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [Guide i18n Next.js](https://nextjs.org/docs/advanced-features/i18n-routing)
- [Unicode RTL guidelines](https://www.unicode.org/reports/tr9/)

## ✅ Statut d'implémentation

### ✅ Terminé
- [x] Configuration next-intl
- [x] Structure des messages FR/HE
- [x] Layout avec support RTL
- [x] Middleware de routing
- [x] Composants utilitaires
- [x] Sélecteur de langue
- [x] Formatage locale-aware
- [x] Documentation complète

### 🚧 En cours / À venir
- [ ] Migration des composants existants
- [ ] Tests d'intégration
- [ ] Optimisation des performances
- [ ] Support d'autres langues (si nécessaire)

---

*Implémentation réalisée le 13 juin 2025 avec next-intl v3.x*
