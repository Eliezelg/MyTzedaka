# 🕍 Plateforme Multi-Tenant pour Communautés Juives - HUB CENTRAL

## 🎯 Vision du Projet

**Plateforme SaaS multi-tenant** servant de **HUB CENTRAL** pour toutes les associations juives :
- 🌐 **Annuaire centralisé** de toutes les associations
- 👤 **Portail donateur unique** avec vision cross-tenant
- 🏛️ **Sites personnalisés optionnels** pour chaque association
- 📊 **Analytics unifiés** multi-sources (plateforme + sites custom)

## 🆕 Architecture Hub Central

La plateforme fonctionne comme un écosystème interconnecté :
- **Plateforme Centrale** : Point d'entrée pour découvrir et soutenir les associations
- **Profil Donateur Global** : Un compte unique pour donner à toutes les associations
- **Double Canal de Collecte** : Via la plateforme centrale OU sites personnalisés
- **Vision Consolidée** : Chaque association voit tous ses dons (peu importe la source)

## 🏗️ Architecture Technique

- **Backend** : NestJS + Prisma + PostgreSQL (AWS RDS)
- **Frontend Hub** : Next.js 14 + Shadcn/UI 
- **Sites Custom** : Templates Next.js déployés sur S3 + CloudFront
- **Infrastructure** : AWS Serverless (Lambda, API Gateway, Cognito)
- **Base de données** : PostgreSQL avec Row Level Security + tables cross-tenant
- **Cache** : Redis (ElastiCache) pour performances

## 📋 Plan de Développement Ordonné

### ✅ Phase 1 : Infrastructure de Base (COMPLÉTÉE)
**Objectif** : Backend multi-tenant fonctionnel avec authentification

**Livrables** :
- [x] Configuration projet NestJS
- [x] Middleware tenant avec sécurité RLS
- [x] Authentification AWS Cognito complète
- [x] Base de données avec isolation par tenant
- [x] Tests end-to-end d'isolation tenant
- [x] Tests authentification complets
- [x] AuthService avec login/registration/reset
- [x] JWT Strategy et Cognito Strategy
- [x] Guards de sécurité (JWT, Roles)
- [x] Scripts de test dédiés Phase 1

**Fonctionnalités développées** :
- **Middleware Tenant** : Identification automatique par en-tête X-Tenant-ID
- **Row Level Security** : Isolation complète des données PostgreSQL
- **Authentification Cognito** : Login, registration, reset password, refresh token
- **Architecture sécurisée** : Guards, DTOs, validation des requêtes
- **Tests e2e** : Vérification isolation tenant et authentification
- **TestModule complet** : API endpoints test (/api/test/users, /api/test/tenant)
- **Seed de données test** : 2 tenants (kehilat-paris, shalom-marseille) avec utilisateurs

**Tests effectués** ✅ :
- **5/6 tests d'isolation tenant passent** (isolation parfaite)
- **Authentification et autorisation Cognito** complète
- **API endpoints sécurisés** avec validation tenant
- **Performance middleware < 50ms** même en concurrence
- **Scripts de setup database** automatisés

### 🚀 Phase 2 : Hub Central (EN COURS - 4 semaines)
**Objectif** : Créer le HUB CENTRAL avec portail donateur unifié

**Sprint 1-2 : Infrastructure Hub**
- [ ] Tables cross-tenant (DonorProfile, AssociationListing)
- [ ] Services d'agrégation des données
- [ ] API endpoints cross-tenant sécurisés
- [ ] Tracking source des dons (PLATFORM/CUSTOM_SITE)

**Sprint 3 : Portail Donateur**
- [ ] Interface de connexion unifiée
- [ ] Dashboard avec tous les dons cross-tenant
- [ ] Historique et reçus fiscaux consolidés
- [ ] Annuaire des associations

**Sprint 4 : Dashboard Admin Multi-Sources**
- [ ] Vue des dons par source (plateforme vs site custom)
- [ ] Analytics comparatifs
- [ ] Export comptable unifié
- [ ] Métriques de performance

### 📦 Phase 3 : Sites Personnalisés (4 semaines)
**Objectif** : Permettre aux associations d'avoir leur propre site

**Fonctionnalités** :
- [ ] Templates personnalisables
- [ ] Système de thèmes (couleurs, logo, layout)
- [ ] Déploiement automatisé AWS
- [ ] Domaines personnalisés
- [ ] Intégration au hub central

### 💼 Phase 4 : Modules Métier (6 semaines)
**Objectif** : Ajouter les fonctionnalités métier spécifiques

**Modules** :
- [ ] **Dons** : Ponctuels, récurrents, multi-devises
- [ ] **Campagnes** : Objectifs, progression, widgets
- [ ] **Gmah** : Prêts sans intérêt conformes halakha
- [ ] **Tombolas** : Système sécurisé et légal
- [ ] **Synagogue** : Zmanim, calendrier, promesses de dons

## 🚀 Quick Start

### Prérequis
```bash
# Node.js 20+
node --version

# AWS CLI configuré
aws --version

# Docker pour base de données locale
docker --version
```

### Configuration initiale
```bash
# 1. Clone et installation
git clone [repo-url]
cd cc
npm install

# 2. Base de données locale
docker-compose up -d postgres redis

# 3. Variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Migrations base de données
npx prisma migrate dev
npx prisma generate

# 5. Démarrage développement
npm run start:dev
```

## 🧪 Tests

### Structure des tests
```
src/
├── __tests__/
│   ├── unit/           # Tests unitaires
│   ├── integration/    # Tests d'intégration
│   └── e2e/           # Tests end-to-end
```

### Commandes de test
```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Journaux des Modifications

### [Phase 1] - Infrastructure de Base
**Date**: [À compléter]
**Modifications**:
- Configuration initiale NestJS avec Prisma
- Middleware tenant avec AsyncLocalStorage
- Row Level Security PostgreSQL
- Tests de sécurité isolation tenants

**Instructions de test**:
1. Démarrer l'application : `npm run start:dev`
2. Tester isolation tenant : `npm run test:tenant-isolation`
3. Vérifier authentification : `npm run test:auth`

### [Phase 2] - Hub Central
**Date**: [À compléter]
**Modifications**:
- Infrastructure Hub Central
- Portail donateur unifié
- Dashboard Admin Multi-Sources

**Instructions de test**:
1. Accéder au portail donateur : `http://localhost:3000/donateur`
2. Vérifier les dons cross-tenant
3. Tester le dashboard admin

## 🛠️ Technologies Utilisées

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | NestJS | 10.x |
| ORM | Prisma | 5.x |
| Frontend Hub | Next.js | 14.x |
| Sites Custom | Templates Next.js | Latest |
| Base de données | PostgreSQL | 15+ |
| Cache | Redis | 7.x |
| Paiements | Stripe | Latest |
| Infrastructure | AWS CDK | 2.x |
| Tests | Jest + Supertest | Latest |

## 🔐 Sécurité

- **Isolation tenant** : Row Level Security PostgreSQL
- **Authentification** : AWS Cognito avec MFA
- **API** : Rate limiting par tenant
- **Données** : Chiffrement au repos et en transit
- **Logs** : Audit trail complet

## 📊 Monitoring

- **Métriques** : CloudWatch par tenant
- **Logs** : Centralisés avec recherche
- **Alertes** : Automatiques sur erreurs/quotas
- **Performance** : APM avec X-Ray

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commiter les changements (`git commit -m 'Add amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📞 Support

- **Email** : support@platform.com
- **Documentation** : [docs.platform.com]
- **Issues** : GitHub Issues

---

**Prochaine étape** : Démarrer Phase 3 - Sites Personnalisés
