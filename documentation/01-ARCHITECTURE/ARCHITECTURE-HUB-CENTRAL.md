# 🌐 Architecture Hub Central - Plateforme Multi-Tenant

## 🎯 Vision Globale

La plateforme fonctionne comme un **HUB CENTRAL** qui :
- Recense TOUTES les associations (avec ou sans site personnalisé)
- Offre une vision unifiée pour les donateurs
- Permet aux associations de collecter via plusieurs canaux
- Centralise les données tout en garantissant l'isolation

## 🏗️ Architecture Conceptuelle

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATEFORME CENTRALE (HUB)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  Annuaire    │    │   Portail    │    │    Admin     │ │
│  │ Associations │    │  Donateurs   │    │   Global     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                              │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
    ┌─────────────▼──────────┐ ┌─────────▼──────────────┐
    │   Site Personnalisé    │ │  Association Simple    │
    │   (Tenant Complet)     │ │  (Sans Site Custom)    │
    │  synagogue-paris.org   │ │  Via Plateforme Only   │
    └────────────────────────┘ └────────────────────────┘
```

## 📊 Flux de Données

### 1. **Donateur Unique - Vision Cross-Tenant**

```typescript
// Un donateur = Un profil global
DonorProfile {
  email: "david@example.com"
  cognitoId: "unique-id"
  
  // Statistiques globales
  totalDonations: 15
  totalAmount: 2500€
  
  // Accès aux différents tenants
  tenantAccess: [
    { tenantId: "synagogue-paris", donations: 5, amount: 1000€ },
    { tenantId: "gmah-lyon", donations: 3, amount: 500€ },
    { tenantId: "ecole-marseille", donations: 7, amount: 1000€ }
  ]
}
```

### 2. **Association - Double Source de Dons**

```typescript
// Tracking source des dons
Donation {
  tenantId: "synagogue-paris"
  amount: 100€
  source: "CUSTOM_SITE" // ou "PLATFORM"
  sourceUrl: "https://synagogue-paris.org/donate"
}
```

## 🔧 Implémentation Technique

### Phase 1 : Hub Central (Priorité)

#### 1.1 Annuaire des Associations
- **Listing public** de toutes les associations
- **Profils détaillés** avec informations et missions
- **Catégorisation** (Synagogues, Écoles, Gmah, etc.)
- **Recherche géographique** et par activité

#### 1.2 Portail Donateur Unifié
- **Connexion unique** pour accès global
- **Dashboard cross-tenant** avec tous les dons
- **Historique consolidé** et reçus fiscaux
- **Gestion centralisée** des moyens de paiement

#### 1.3 Système de Routage Intelligent
- **Détection origine** du don (platform vs custom site)
- **Attribution correcte** au tenant
- **Tracking complet** du parcours donateur

### Phase 2 : Sites Personnalisés

#### 2.1 Tenant Complet
- **Frontend dédié** avec domaine personnalisé
- **Thème personnalisé** (couleurs, logo, layout)
- **Modules activables** selon besoins
- **Connexion au hub** pour synchronisation

#### 2.2 Intégration Bidirectionnelle
- **API Gateway central** pour tous les tenants
- **Webhooks** pour synchronisation temps réel
- **Cache partagé** pour performances
- **Analytics unifiés** cross-sources

## 📈 Dashboards

### Dashboard Donateur (Plateforme Centrale)

```
┌─────────────────────────────────────────────┐
│           MES CONTRIBUTIONS                  │
├─────────────────────────────────────────────┤
│                                             │
│ Total Général : 2,500€ | 15 dons           │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Synagogue Paris         1,000€ (5)  │    │
│ │ ├─ Via leur site:        600€ (3)  │    │
│ │ └─ Via plateforme:       400€ (2)  │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Gmah Lyon                500€ (3)   │    │
│ │ └─ Via plateforme:       500€ (3)  │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [Télécharger tous mes reçus fiscaux]       │
└─────────────────────────────────────────────┘
```

### Dashboard Admin Association

```
┌─────────────────────────────────────────────┐
│        TABLEAU DE BORD - SYNAGOGUE PARIS    │
├─────────────────────────────────────────────┤
│                                             │
│ Collecte Totale : 25,000€ | 150 donateurs  │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Sources des Dons :                   │    │
│ │                                      │    │
│ │ 📊 Notre Site      : 15,000€ (60%) │    │
│ │ 🌐 Plateforme      : 10,000€ (40%) │    │
│ │                                      │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ [Voir détails] [Exporter] [Analytics]      │
└─────────────────────────────────────────────┘
```

## 🔒 Sécurité & Isolation

### Principes Fondamentaux
1. **Isolation stricte** des données entre tenants
2. **Accès cross-tenant** uniquement pour les donateurs (leurs propres données)
3. **API Gateway** avec validation tenant sur chaque requête
4. **Audit trail** complet de tous les accès

### Implémentation
```typescript
// Middleware de sécurité
export class CrossTenantSecurityMiddleware {
  async use(req, res, next) {
    const user = req.user;
    const requestedTenantId = req.params.tenantId;
    
    // Si c'est un donateur accédant à ses propres données
    if (user.role === 'DONOR' && req.path.includes('/my-donations')) {
      // Autoriser l'accès cross-tenant pour SES donations uniquement
      req.crossTenantAccess = true;
      req.allowedTenants = await this.getDonorTenants(user.id);
    }
    
    // Si c'est un admin association
    else if (user.role === 'ADMIN' && user.tenantId === requestedTenantId) {
      // Accès normal au tenant
      req.tenantId = requestedTenantId;
    }
    
    next();
  }
}
```

## 🚀 Roadmap d'Implémentation

### Sprint 1 : Infrastructure Hub (2 semaines)
- [ ] Tables `DonorProfile` et `TenantDonorAccess`
- [ ] Table `AssociationListing` pour l'annuaire
- [ ] API endpoints cross-tenant sécurisés
- [ ] Service de synchronisation

### Sprint 2 : Portail Donateur (2 semaines)
- [ ] Interface de connexion unifiée
- [ ] Dashboard cross-tenant
- [ ] Historique consolidé
- [ ] Export de reçus fiscaux

### Sprint 3 : Dashboard Admin Enrichi (1 semaine)
- [ ] Vue des sources de dons
- [ ] Analytics par canal
- [ ] Comparaisons et tendances
- [ ] Export comptable unifié

### Sprint 4 : Sites Personnalisés (3 semaines)
- [ ] Template de base personnalisable
- [ ] Système de thèmes
- [ ] Déploiement automatisé
- [ ] Intégration au hub

## 📋 Checklist Technique

### Backend
- [ ] Migration base de données avec nouvelles tables
- [ ] Services cross-tenant sécurisés
- [ ] API Gateway avec routage intelligent
- [ ] Webhooks pour synchronisation
- [ ] Jobs de consolidation des stats

### Frontend Hub
- [ ] Page d'accueil avec annuaire
- [ ] Portail donateur responsive
- [ ] Dashboard admin multi-sources
- [ ] Système de notifications

### Infrastructure
- [ ] Lambda functions pour APIs
- [ ] S3 + CloudFront par tenant
- [ ] Route 53 pour domaines custom
- [ ] ElastiCache pour performances

## 🎯 Bénéfices

### Pour les Donateurs
- ✅ **Un seul compte** pour toutes les associations
- ✅ **Vision globale** de leur générosité
- ✅ **Gestion simplifiée** des reçus fiscaux
- ✅ **Découverte** de nouvelles associations

### Pour les Associations
- ✅ **Double canal** de collecte (site + plateforme)
- ✅ **Visibilité accrue** via l'annuaire
- ✅ **Analytics complets** multi-sources
- ✅ **Flexibilité** (avec ou sans site custom)

### Pour la Plateforme
- ✅ **Effet réseau** renforcé
- ✅ **Monétisation** multiple (abonnement + commission)
- ✅ **Data insights** globaux
- ✅ **Position dominante** sur le marché

---

Cette architecture garantit une expérience unifiée tout en respectant l'autonomie et l'identité de chaque association.
