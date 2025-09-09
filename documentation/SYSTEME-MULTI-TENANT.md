# Documentation du Système Multi-Tenant MyTzedaka

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture globale](#architecture-globale)
3. [Système d'inscription (Signup)](#système-dinscription-signup)
4. [Sites personnalisés](#sites-personnalisés)
5. [Flux de données](#flux-de-données)
6. [Modules et personnalisation](#modules-et-personnalisation)
7. [Authentification et sécurité](#authentification-et-sécurité)
8. [Portail donateur](#portail-donateur)
9. [Administration](#administration)
10. [API et intégrations](#api-et-intégrations)

---

## 🎯 Vue d'ensemble

MyTzedaka est une plateforme SaaS multi-tenant permettant aux associations juives de créer leur présence en ligne et de collecter des dons. Le système offre deux modes principaux :

### Modes de fonctionnement

1. **Mode Gratuit (Hub)** : L'association obtient une page sur la plateforme centrale
   - URL : `mytzedaka.com/associations/nom-association`
   - Commission : 5% sur les dons
   - Fonctionnalités de base

2. **Mode Premium (Site Custom)** : Site web personnalisé complet
   - Domaine personnalisé : `association.com`
   - Abonnement : 10€/mois ou 100€/an
   - Sans commission (seulement frais Stripe)
   - Toutes les fonctionnalités avancées

---

## 🏗️ Architecture globale

### Structure des dossiers

```
frontend-hub/src/
├── app/
│   ├── signup/                 # Page d'inscription des nouvelles associations
│   │   └── page.tsx            # Flow d'onboarding complet
│   │
│   └── sites/                  # Système multi-tenant pour sites personnalisés
│       └── [domain]/           # Route dynamique par domaine
│           ├── [[...slug]]/    # Pages CMS dynamiques
│           ├── admin/          # Interface d'administration
│           ├── auth/           # Authentification (login/register)
│           ├── donor/          # Portail donateur
│           └── layout.tsx      # Layout avec providers
│
├── components/
│   ├── onboarding/
│   │   └── AssociationSignupFlow.tsx  # Composant d'inscription réutilisable
│   │
│   └── sites/
│       ├── admin/              # Composants d'administration
│       ├── blocks/             # Blocs de contenu modulaires
│       ├── donor/              # Composants portail donateur
│       ├── layout/             # Header/Footer dynamiques
│       └── pages/              # Renderers de pages
│
├── providers/
│   ├── tenant-provider.tsx    # Context pour tenant actuel
│   └── auth-provider.tsx      # Context d'authentification
│
└── lib/
    ├── tenant/
    │   └── tenant-resolver.ts  # Résolution et cache des tenants
    └── theme/
        └── theme-engine.ts     # Moteur de thèmes dynamiques
```

### Schéma de résolution des tenants

```mermaid
graph TD
    A[Requête entrante] --> B{Résolution du tenant}
    B -->|Domaine custom| C[association.com]
    B -->|Sous-domaine| D[association.mytzedaka.com]
    B -->|Path-based| E[/sites/association/...]
    
    C --> F[getTenantByDomain]
    D --> F
    E --> F
    
    F --> G[Cache React]
    G --> H[API Backend]
    H --> I[Tenant Context]
    
    I --> J[Chargement modules]
    I --> K[Chargement thème]
    I --> L[Navigation dynamique]
```

---

## 🚀 Système d'inscription (Signup)

### Flow d'inscription (`/signup`)

Le processus d'inscription est géré par `AssociationSignupFlow` avec deux modes :

#### Mode Standalone (page dédiée)
5 étapes complètes :
1. **Choix du plan** : Gratuit vs Premium avec comparaison
2. **Informations association** : Nom, type, description
3. **Adresse** : Adresse officielle pour reçus fiscaux
4. **Contact** : Responsable de l'association
5. **Récapitulatif** : Vérification et paiement

#### Mode Embedded (intégration hub)
3 étapes simplifiées pour inscription rapide depuis le hub

### Caractéristiques du composant

```typescript
interface AssociationSignupFlowProps {
  mode?: 'standalone' | 'embedded';
  onSuccess?: (data: any) => void;
  defaultPlan?: 'free' | 'premium';
}
```

**Fonctionnalités clés** :
- Génération automatique de slug URL
- Vérification de disponibilité en temps réel
- Intégration Stripe pour paiement premium
- Validation progressive des formulaires
- Design responsive avec indicateurs de progression

---

## 🌐 Sites personnalisés

### Architecture multi-tenant (`/sites/[domain]`)

Chaque association dispose d'un site isolé avec :

#### Layout principal (`layout.tsx`)
- **TenantProvider** : Injection du contexte tenant
- **AuthProvider** : Gestion de l'authentification
- **Métadonnées dynamiques** : SEO personnalisé par tenant
- **Thème personnalisé** : Variables CSS dynamiques

#### Pages dynamiques (`[[...slug]]/page.tsx`)
- Routes CMS pour pages personnalisées
- Routes spéciales : donate, campaigns, events, zmanim
- Système de blocs modulaires
- Support de différents types de pages (BLOG, FAQ, GALLERY, etc.)

### Providers et Context

#### TenantProvider
```typescript
interface TenantContextType {
  tenant: Tenant;
  modules: TenantModules;
  navigation: any;
  theme: any;
  isModuleEnabled: (moduleName: keyof TenantModules) => boolean;
}
```

#### AuthProvider
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
```

---

## 🔄 Flux de données

### Cycle de vie d'une requête

1. **Résolution du tenant**
   - Cache React avec `cache()` pour performances
   - Revalidation toutes les 5 minutes
   - Fallback sur modules par défaut

2. **Chargement des données**
   ```typescript
   // Parallélisation des requêtes
   const [tenant, modules, navigation] = await Promise.all([
     getTenantByDomain(domain),
     getTenantModules(tenantId),
     getTenantNavigation(tenantId)
   ]);
   ```

3. **Rendu conditionnel**
   - Server Components pour données statiques
   - Client Components pour interactivité
   - Streaming avec Suspense boundaries

---

## 🧩 Modules et personnalisation

### Modules disponibles

#### Modules de base
- **donations** : Système de dons avec Stripe
- **campaigns** : Campagnes de collecte
- **events** : Gestion d'événements
- **blog** : Articles et actualités
- **gallery** : Galeries photos/vidéos

#### Modules synagogue
- **zmanim** : Horaires religieux géolocalisés
- **prayers** : Planning des offices
- **courses** : Cours de Torah
- **hebrewCalendar** : Calendrier hébraïque
- **members** : Gestion des membres

#### Modules avancés
- **library** : Bibliothèque de contenus
- **yahrzeits** : Commémorations
- **seatingChart** : Plan de synagogue
- **mikvah** : Réservation mikvé
- **kashrut** : Certifications
- **eruv** : Carte de l'érouv

### Système de thèmes

#### Thèmes prédéfinis
1. **Modern** : Design épuré, bleu/violet
2. **Classic** : Style traditionnel, serif
3. **Jerusalem** : Tons terre, inspiration Jérusalem

#### Personnalisation (`ThemeCustomizer`)
- Éditeur visuel de couleurs
- Typographie personnalisable
- Variables de mise en page
- Import/Export JSON
- Génération CSS automatique
- Support mode sombre optionnel

```typescript
interface ThemeConfig {
  colors: {
    primary, secondary, accent,
    background, foreground, muted,
    success, warning, error, info
  };
  typography: {
    fontFamily: { sans, serif, hebrew };
    fontSize: { base, scale };
  };
  layout: {
    maxWidth, spacing, borderRadius
  };
}
```

---

## 🔐 Authentification et sécurité

### Système JWT avec refresh tokens

#### Flow d'authentification
1. Login avec email/password
2. Réception access token (1h) + refresh token (7j)
3. Refresh automatique avant expiration
4. Stockage sécurisé localStorage

#### Rôles et permissions
```typescript
enum UserRole {
  SUPER_ADMIN,  // Administrateur plateforme
  ADMIN,        // Administrateur association
  TREASURER,    // Trésorier
  MANAGER,      // Gestionnaire
  MEMBER        // Membre/Donateur
}
```

#### Protection des routes
```typescript
// HOC pour routes protégées
export function withAuth(Component, options?: {
  requireAdmin?: boolean;
  redirectTo?: string;
})
```

### Multi-tenancy et isolation

- **Tenant ID dans headers** : `X-Tenant-ID`
- **Isolation des données** : Chaque requête filtrée par tenantId
- **Utilisateurs globaux** : tenantId: null pour accès hub
- **Cross-tenant tracking** : Suivi des dons inter-associations

---

## 👤 Portail donateur

### Fonctionnalités (`DonorPortal`)

#### Dashboard personnalisé
- Statistiques : total dons, nombre, moyenne
- Graphiques d'évolution
- Badges de fidélité

#### Gestion des dons
- Historique complet avec filtres
- Détails par campagne
- Dons récurrents
- Export CSV/PDF

#### Reçus fiscaux
- Génération automatique CERFA
- Téléchargement PDF
- Envoi par email
- Archive annuelle

#### Profil utilisateur
- Informations personnelles
- Préférences de communication
- Adresse pour reçus
- Suppression RGPD

### Parrainages Parnass
- Sponsoring de jours/mois/années
- Calendrier interactif
- Notifications anniversaires
- Certificats personnalisés

---

## ⚙️ Administration

### Interface admin (`/sites/[domain]/admin`)

#### Tableau de bord
- Statistiques en temps réel
- Graphiques de performance
- Activité récente
- Actions rapides

#### Gestion de contenu (`PageEditor`)
- Éditeur WYSIWYG
- Blocs drag & drop
- Prévisualisation temps réel
- Versions et brouillons

#### Configuration Parnass (`ParnassManager`)
- Tarifs par période
- Disponibilités
- Réservations
- Rapports financiers

#### Personnalisation (`ThemeCustomizer`)
- Éditeur visuel
- Thèmes prédéfinis
- CSS personnalisé
- Aperçu en direct

#### Modules (`ModulesManager`)
- Activation/désactivation
- Configuration par module
- Permissions
- Intégrations tierces

---

## 🔌 API et intégrations

### Endpoints principaux

#### Tenant
```
GET  /api/tenant/resolve/{domain}
GET  /api/tenant/{id}/modules
GET  /api/tenant/{id}/navigation
PUT  /api/tenant/{id}/theme
```

#### Authentification
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET  /api/auth/me
```

#### Donations
```
GET  /api/donor/donations
GET  /api/donor/tax-receipts
GET  /api/donor/stats
POST /api/donations/create
```

### Intégrations externes

#### Stripe
- Stripe Connect pour mode PLATFORM
- API Keys chiffrées pour mode CUSTOM
- Webhooks pour synchronisation
- Support multi-devises

#### AWS Cognito
- Authentification centralisée
- MFA optionnel
- Social login
- Password policies

#### Services tiers
- SendGrid pour emails
- Cloudinary pour médias
- Google Maps pour localisation
- Analytics pour statistiques

---

## 🚀 Patterns et bonnes pratiques

### Patterns architecturaux

1. **Server Components First**
   - Données statiques côté serveur
   - Hydratation sélective
   - Streaming avec Suspense

2. **Provider Pattern**
   - Contexts pour état global
   - Composition pour réutilisabilité
   - Memoization pour performances

3. **Atomic Design**
   - Composants UI réutilisables
   - Blocs modulaires
   - Variants avec CVA

4. **Cache Strategy**
   - React cache() pour déduplication
   - Next.js revalidate pour fraîcheur
   - Optimistic updates

### Conventions de code

```typescript
// Naming
components/ComponentName.tsx  // PascalCase
hooks/useHookName.ts         // camelCase avec "use"
lib/utility-function.ts      // kebab-case

// Structure composant
export function Component() {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Handlers
  // 5. Render
}

// Types
interface Props {}  // Pour composants
type Config = {}    // Pour configuration
```

### Performance

- **Code splitting** : Import dynamique pour routes
- **Image optimization** : Next/Image avec lazy loading
- **Bundle size** : Tree shaking et minification
- **Caching** : CDN + Edge caching
- **Database** : Indexes et query optimization

---

## 📝 Conclusion

Le système multi-tenant MyTzedaka offre une solution complète pour la gestion d'associations avec :

✅ **Flexibilité** : Du mode gratuit au site personnalisé complet
✅ **Scalabilité** : Architecture modulaire et cache optimisé
✅ **Sécurité** : Isolation des données et authentification robuste
✅ **Personnalisation** : Thèmes, modules et contenu dynamiques
✅ **UX** : Interfaces modernes et responsive

Le système est conçu pour évoluer avec les besoins des associations tout en maintenant performances et sécurité.