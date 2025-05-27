# 🎨 Phase 9 : Sites Personnalisés

**Statut** : 🚧 Planifié (Août 2025)  
**Objectif** : Permettre à chaque association de disposer d'un site personnalisé à leur image

## 🎯 Vision Globale

La Phase 9 étendra les capacités multi-tenant de MyTzedaka en permettant à chaque association de bénéficier d'un site web entièrement personnalisé tout en profitant de l'infrastructure partagée. Cette approche "hub and spoke" renforcera l'identité de chaque association tout en mutualisant les coûts de développement et de maintenance.

## 📋 Objectifs Principaux

### 1. Système Multi-tenant Avancé
- **Domaines personnalisés** : mydomain.com vs mydomain.mytzedaka.com
- **Architecture isolée** : Données séparées par tenant
- **Routage intelligent** : Redirection selon domaine
- **Caching adaptatif** : Cache par tenant
- **Performance optimisée** : Ressources dédiées selon plan

### 2. Personnalisation Visuelle
- **Thèmes personnalisables** : Couleurs, typographies, styles
- **Logo et marque** : Intégration identité visuelle
- **Layouts modulaires** : Structure de page adaptable
- **Assets spécifiques** : Bibliothèque médias dédiée
- **Design responsif** : Adapté à chaque marque

### 3. Pages et Contenu Custom
- **CMS léger intégré** : Gestion de contenu
- **Pages statiques** : À propos, équipe, valeurs
- **Blocs dynamiques** : Composants réutilisables
- **Blog/Actualités** : Système de publication
- **SEO optimisé** : Méta-données par tenant

### 4. Analytiques Multi-niveaux
- **Dashboard global** : Vue d'ensemble plateforme
- **Dashboard tenant** : Métriques par association
- **Comparaison** : Benchmarking entre associations
- **Attribution** : Tracking sources trafic/dons
- **Prédictions** : Tendances et suggestions

## 🧩 Composants à Développer

### Composants Multi-tenant
- `TenantRouter` : Routeur domaine → tenant
- `TenantMiddleware` : Middleware isolation données
- `DomainManager` : Gestionnaire domaines personnalisés
- `ResourceAllocator` : Allocation ressources par tenant

### Composants Personnalisation
- `ThemeBuilder` : Constructeur de thèmes
- `StyleInjector` : Injecteur CSS dynamique
- `LayoutCustomizer` : Personnalisation layouts
- `BrandingManager` : Gestionnaire identité visuelle

### Composants CMS
- `PageBuilder` : Constructeur pages statiques
- `ContentEditor` : Éditeur WYSIWYG
- `MediaLibrary` : Bibliothèque médias
- `BlogManager` : Gestionnaire blog/actualités
- `SEOOptimizer` : Optimiseur référencement

### Composants Analytiques
- `MultiTenantAnalytics` : Analytics multi-niveaux
- `ComparisonDashboard` : Tableau comparatif
- `AttributionTracker` : Suivi sources trafic/dons
- `TrendPredictor` : Prédicteur tendances

## 🔄 Intégrations API

### API Multi-tenant
- `GET /api/tenants/:domain` : Récupération config tenant
- `POST /api/tenants/register` : Enregistrement nouveau tenant
- `PUT /api/tenants/:id/config` : Mise à jour config tenant

### API Personnalisation
- `GET /api/tenants/:id/theme` : Récupération thème
- `PUT /api/tenants/:id/theme` : Mise à jour thème
- `POST /api/tenants/:id/assets` : Upload assets

### API CMS
- `GET /api/tenants/:id/pages` : Pages statiques
- `POST /api/tenants/:id/pages` : Création page
- `GET /api/tenants/:id/blog` : Articles blog
- `POST /api/tenants/:id/blog` : Publication article

### API Analytiques
- `GET /api/analytics/global` : Métriques globales
- `GET /api/analytics/tenants/:id` : Métriques tenant
- `GET /api/analytics/comparison` : Comparaison tenants

## 📊 Modèles de Données à Ajouter

### Modèle TenantTheme
```prisma
model TenantTheme {
  id            String   @id @default(uuid())
  tenantId      String   @unique
  primaryColor  String   @default("#3B82F6") // blue-500
  secondaryColor String  @default("#8B5CF6") // violet-500
  accentColor   String   @default("#F59E0B") // amber-500
  textColor     String   @default("#1F2937") // gray-800
  backgroundColor String @default("#FFFFFF") // white
  fontPrimary   String   @default("Inter")
  fontSecondary String   @default("Poppins")
  borderRadius  Int      @default(6)
  boxShadow     String   @default("sm") // sm, md, lg
  buttonStyle   String   @default("rounded") // rounded, pill, square
  logoUrl       String?
  faviconUrl    String?
  customCSS     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
}
```

### Modèle TenantPage
```prisma
model TenantPage {
  id          String   @id @default(uuid())
  tenantId    String
  slug        String
  title       String
  content     String   @db.Text
  isPublished Boolean  @default(true)
  metaTitle   String?
  metaDescription String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, slug])
}
```

### Modèle TenantBlogPost
```prisma
model TenantBlogPost {
  id          String   @id @default(uuid())
  tenantId    String
  authorId    String
  slug        String
  title       String
  excerpt     String
  content     String   @db.Text
  coverImage  String?
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  tags        String[]
  metaTitle   String?
  metaDescription String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  author      User     @relation(fields: [authorId], references: [id])
  
  @@unique([tenantId, slug])
}
```

## 🧪 Tests à Implémenter

- **Tests Multi-tenant** : Isolation des données
- **Tests Performance** : Charge par tenant
- **Tests Personnalisation** : Thèmes et layouts
- **Tests CMS** : Création et rendu contenu
- **Tests SEO** : Validation méta-données
- **Tests Domaines** : Routage et DNS

## 📈 Métriques de Réussite

- **Adoption** : 75% des associations utilisent site custom
- **Engagement** : +40% temps sur site vs hub central
- **Conversion** : +30% taux conversion donations
- **Performance** : Score Lighthouse > 90 pour chaque site
- **SEO** : Amélioration classement recherche +20%

## 🚀 Prochaines Étapes

1. **Sprint 1** : Infrastructure Multi-tenant Avancée
2. **Sprint 2** : Système de Personnalisation Visuelle
3. **Sprint 3** : CMS et Gestion de Contenu
4. **Sprint 4** : Analytiques Multi-niveaux et Tests

## 💡 Ressources et Références

- **Architecture** : Next.js App Router (multi-tenant)
- **Personnalisation** : TailwindCSS + CSS Variables
- **CMS** : TipTap (éditeur) + React Bricks (blocks)
- **Analytiques** : Mixpanel + Segment
- **SEO** : Next.js Metadata API

---

*Document créé le 27 mai 2025*  
*Dernière mise à jour : 27 mai 2025*
