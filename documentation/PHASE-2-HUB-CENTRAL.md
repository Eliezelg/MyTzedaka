# 🚀 Phase 2 : Développement du Hub Central

## 🎯 Objectif Principal

Créer le **HUB CENTRAL** qui permet aux donateurs d'avoir une vision unifiée cross-tenant de toutes leurs contributions, tout en conservant l'isolation sécurisée des données par tenant.

## 📋 Vision Fonctionnelle

### 🌐 Pour les Donateurs
- **Compte unique** : Un seul login pour accéder à toutes les associations
- **Vision consolidée** : Voir tous ses dons peu importe l'association ou la source
- **Historique unifié** : Timeline complète de tous les dons avec filtres
- **Reçus centralisés** : Tous les CERFA accessibles depuis un seul endroit
- **Découverte** : Annuaire complet des associations avec recherche et filtres

### 🏛️ Pour les Associations
- **Analytics multi-sources** : Dons reçus via plateforme centrale ET site personnalisé
- **Distinction claire** : Chaque don marqué avec sa source (PLATFORM/CUSTOM_SITE)
- **Export unifié** : Comptabilité consolidée toutes sources confondues
- **Performance** : Comparaison plateforme vs site custom

## 🏗️ Architecture Technique

### 📊 Nouvelles Tables Cross-Tenant

```prisma
// Profil donateur global (cross-tenant)
model DonorProfile {
  id              String   @id @default(cuid())
  cognitoUserId   String   @unique  // Lien avec AWS Cognito
  email           String   @unique
  firstName       String
  lastName        String
  phone           String?
  address         Json?    // Adresse complète pour CERFA
  preferences     Json?    // Préférences de notification, etc.
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations cross-tenant
  donations       Donation[]
  favoriteAssocs  AssociationListing[]
  
  @@map("donor_profiles")
}

// Listing global des associations (toutes confondues)
model AssociationListing {
  id                String   @id @default(cuid())
  tenantId          String   // Référence au tenant
  name              String
  description       String?
  category          String   // synagogue, tzedaka, education, etc.
  city              String?
  region            String?
  logo              String?
  website           String?
  hasCustomSite     Boolean  @default(false)
  customDomain      String?
  isActive          Boolean  @default(true)
  featured          Boolean  @default(false)
  totalDonations    Decimal  @default(0) @db.Decimal(10,2)
  donorCount        Int      @default(0)
  lastDonationAt    DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  donations         Donation[]
  favoredBy         DonorProfile[]
  
  @@map("association_listings")
  @@index([category])
  @@index([city])
  @@index([featured])
}
```

### 🔄 Extension Table Donations

```prisma
model Donation {
  // Champs existants...
  id          String        @id @default(cuid())
  tenantId    String
  amount      Decimal       @db.Decimal(10,2)
  currency    String        @default("EUR")
  status      DonationStatus
  
  // NOUVEAUX CHAMPS HUB CENTRAL
  source         DonationSource  @default(PLATFORM)  // PLATFORM ou CUSTOM_SITE
  donorProfileId String?         // Lien vers profil global donateur
  associationId  String?         // Lien vers listing association
  
  // Relations étendues
  donorProfile   DonorProfile?     @relation(fields: [donorProfileId], references: [id])
  association    AssociationListing? @relation(fields: [associationId], references: [id])
  
  @@map("donations")
}

enum DonationSource {
  PLATFORM     // Don fait via la plateforme centrale
  CUSTOM_SITE  // Don fait via le site personnalisé de l'association
}
```

## 📅 Planning Détaillé - 4 Semaines

### 🛠️ Semaine 1 : Infrastructure Cross-Tenant

**Objectifs** :
- Implémenter les nouvelles tables cross-tenant
- Créer les services d'agrégation des données
- Développer les API endpoints cross-tenant sécurisés

**Livrables** :
- [ ] **Migration Prisma** : Nouvelles tables `DonorProfile` et `AssociationListing`
- [ ] **Extension table Donations** : Champs `source`, `donorProfileId`, `associationId`
- [ ] **DonorService** : Service de gestion des profils donateurs cross-tenant
- [ ] **AssociationListingService** : Service annuaire global des associations
- [ ] **API Endpoints** : `/api/donor/profile`, `/api/associations/directory`
- [ ] **Tests unitaires** : Validation des nouveaux services
- [ ] **Seed données** : Profils donateurs et associations test

**Architecture** :
```typescript
// Services principaux
src/
├── donor-portal/
│   ├── donor-portal.module.ts
│   ├── services/
│   │   ├── donor.service.ts           // Gestion profils donateurs
│   │   ├── donation-aggregator.service.ts  // Agrégation cross-tenant
│   │   └── association-listing.service.ts  // Annuaire global
│   ├── controllers/
│   │   ├── donor.controller.ts        // API profil donateur
│   │   └── directory.controller.ts    // API annuaire associations
│   └── dto/
│       ├── donor-profile.dto.ts
│       └── association-search.dto.ts
```

### 🎨 Semaine 2 : Portail Donateur Frontend

**Objectifs** :
- Créer l'interface du portail donateur unifié
- Implémenter la recherche et découverte d'associations
- Développer le dashboard des dons cross-tenant

**Livrables** :
- [ ] **Page connexion unifiée** : Login unique pour accès cross-tenant
- [ ] **Dashboard donateur** : Vue d'ensemble de tous les dons
- [ ] **Historique consolidé** : Timeline avec filtres par association/date/montant
- [ ] **Annuaire associations** : Recherche, filtres, cartes interactives
- [ ] **Gestion profil** : Modification données personnelles et préférences
- [ ] **Responsive design** : Interface mobile-first avec Shadcn/UI

**Structure Frontend** :
```typescript
frontend-hub/
├── app/
│   ├── (donor-portal)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              // Dashboard principal
│   │   │   └── components/
│   │   │       ├── DonationSummary.tsx
│   │   │       ├── RecentDonations.tsx
│   │   │       └── FavoriteAssociations.tsx
│   │   ├── history/
│   │   │   ├── page.tsx              // Historique complet
│   │   │   └── components/
│   │   │       ├── DonationFilter.tsx
│   │   │       └── DonationTimeline.tsx
│   │   ├── directory/
│   │   │   ├── page.tsx              // Annuaire associations
│   │   │   └── components/
│   │   │       ├── AssociationCard.tsx
│   │   │       ├── SearchFilters.tsx
│   │   │       └── MapView.tsx
│   │   └── profile/
│   │       └── page.tsx              // Gestion profil
```

### 📊 Semaine 3 : Analytics Multi-Sources

**Objectifs** :
- Développer le dashboard admin avec vision multi-sources
- Implémenter les métriques de performance par source
- Créer les exports comptables unifiés

**Livrables** :
- [ ] **Dashboard admin étendu** : Vue des dons par source (plateforme vs custom)
- [ ] **Analytics comparatifs** : Graphiques performance PLATFORM vs CUSTOM_SITE
- [ ] **Métriques avancées** : Conversion, récurrence, panier moyen par source
- [ ] **Export unifié** : Comptabilité consolidée toutes sources
- [ ] **Rapport mensuel** : PDF automatique avec analytics multi-sources
- [ ] **API reporting** : Endpoints dédiés aux statistics cross-tenant

**Extension Admin Service** :
```typescript
// Extension du AdminService existant
export class AdminService {
  // Méthodes existantes...
  
  // NOUVELLES MÉTHODES MULTI-SOURCES
  async getMultiSourceStats(tenantId: string) {
    // Stats comparatives PLATFORM vs CUSTOM_SITE
    const platformDonations = await this.getDonationsBySource(tenantId, 'PLATFORM');
    const customSiteDonations = await this.getDonationsBySource(tenantId, 'CUSTOM_SITE');
    
    return {
      platform: {
        total: platformDonations.total,
        count: platformDonations.count,
        average: platformDonations.average,
        growth: platformDonations.growth
      },
      customSite: {
        total: customSiteDonations.total,
        count: customSiteDonations.count,
        average: customSiteDonations.average,
        growth: customSiteDonations.growth
      },
      comparison: {
        totalRatio: platformDonations.total / customSiteDonations.total,
        countRatio: platformDonations.count / customSiteDonations.count,
        conversionRate: this.calculateConversionRates(tenantId)
      }
    };
  }
  
  async generateUnifiedExport(tenantId: string, startDate: Date, endDate: Date) {
    // Export comptable unifié toutes sources
  }
}
```

### 🔧 Semaine 4 : Intégration et Tests E2E

**Objectifs** :
- Intégrer tous les composants du Hub Central
- Valider les flux end-to-end cross-tenant
- Optimiser les performances des requêtes cross-tenant

**Livrables** :
- [ ] **Tests E2E Hub Central** : Scénarios complets donateur cross-tenant
- [ ] **Tests isolation sécurisée** : Validation que les données restent cloisonnées
- [ ] **Tests performance** : Requêtes cross-tenant optimisées
- [ ] **Cache Redis étendu** : Stratégies de cache pour données globales
- [ ] **Documentation API** : Swagger complet pour nouveaux endpoints
- [ ] **Guide déploiement** : Procédures de mise en production

**Tests E2E Critiques** :
```typescript
// test/hub-central.e2e-spec.ts
describe('Hub Central E2E', () => {
  it('should allow donor to see all donations across tenants', async () => {
    // 1. Créer donateur avec dons sur 2 tenants différents
    // 2. Login unique
    // 3. Vérifier vision consolidée
    // 4. Vérifier isolation sécurisée (ne voit que SES dons)
  });
  
  it('should show association multi-source analytics', async () => {
    // 1. Créer dons via PLATFORM et CUSTOM_SITE
    // 2. Admin login
    // 3. Vérifier analytics séparées par source
    // 4. Vérifier totaux consolidés
  });
  
  it('should maintain data isolation while allowing cross-tenant views', async () => {
    // Test critique : cross-tenant autorisé UNIQUEMENT pour ses propres données
  });
});
```

## 🔐 Sécurité Cross-Tenant

### 🛡️ Principes de Sécurité

1. **Isolation maintenue** : Les tenants restent complètement isolés
2. **Accès contrôlé** : Un donateur ne voit QUE ses propres données cross-tenant
3. **Validation stricte** : Chaque requête cross-tenant validée par JWT + tenant context
4. **Audit trail** : Logging de tous les accès cross-tenant

### 🔑 Mécanisme d'Autorisation

```typescript
// Nouveau Guard pour accès cross-tenant
@Injectable()
export class CrossTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // Depuis JWT
    
    // Vérifier que l'utilisateur accède uniquement à SES données
    if (request.params.donorProfileId !== user.donorProfileId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    
    return true;
  }
}

// Usage sur les routes cross-tenant
@Controller('api/donor')
@UseGuards(JwtAuthGuard, CrossTenantGuard)
export class DonorController {
  @Get('profile/:donorProfileId/donations')
  async getDonorDonationsAcrossAllTenants(@Param('donorProfileId') donorProfileId: string) {
    // API sécurisée : un donateur ne voit que SES dons cross-tenant
  }
}
```

## 📈 Métriques de Succès

### 🎯 KPIs Phase 2

- **Performance** : API cross-tenant < 200ms
- **Sécurité** : 0 accès non autorisé cross-tenant
- **Adoption** : Dashboard donateur utilisé par > 80% des utilisateurs connectés
- **Analytics** : Admins accèdent aux stats multi-sources quotidiennement
- **Tests** : Couverture > 90% sur nouveaux composants

### 📊 Métriques Fonctionnelles

- **Vision donateur** : Affichage correct de 100% des dons cross-tenant
- **Découverte associations** : Recherche < 500ms sur 10000+ associations
- **Export comptable** : Génération PDF < 30s pour 1 an de données
- **Cache efficacité** : Hit rate > 85% sur données global

## 🔄 Migration des Données Existantes

### 📋 Plan de Migration

1. **Phase préparatoire** :
   - Backup complet de la base de données
   - Tests migration sur environnement de staging

2. **Migration données** :
   - Création `DonorProfile` pour tous les utilisateurs existants
   - Population `AssociationListing` depuis les tenants
   - Mise à jour `Donation` avec nouveaux champs

3. **Validation post-migration** :
   - Tests e2e complets
   - Vérification intégrité des données
   - Performance benchmark

## 🚀 Prochaines Étapes

Une fois la Phase 2 terminée, nous aurons :

✅ **Hub Central fonctionnel** avec vision donateur unifiée
✅ **Analytics multi-sources** pour les associations  
✅ **Infrastructure prête** pour sites personnalisés (Phase 3)
✅ **Base solide** pour modules métier avancés (Phase 4)

La Phase 2 pose les fondations du véritable écosystème multi-tenant avec le Hub Central comme pivot de l'expérience utilisateur.
