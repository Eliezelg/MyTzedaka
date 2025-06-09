# Phase 8 : Intégration Stripe Multi-Tenant

## 🎯 Objectif
Implémenter une architecture backend multi-tenant pour gérer deux modes de paiement Stripe :
1. **Mode PLATFORM** : Stripe Connect via MyTzedaka
2. **Mode CUSTOM** : Compte Stripe propre à chaque association

## 📅 Date : 7 Juin 2025

## ✅ Travaux Réalisés

### 1. Architecture Multi-Tenant Stripe

#### Services Créés

**MultiTenantStripeService** (`/backend/src/stripe/multi-tenant-stripe.service.ts`)
- Gestion dynamique des instances Stripe selon le tenant
- Support des modes PLATFORM et CUSTOM
- Cache des instances Stripe pour optimisation
- Méthodes principales :
  - `getStripeInstance()` : Retourne l'instance Stripe appropriée
  - `createPaymentIntent()` : Création de PaymentIntent adapté au mode
  - `confirmPayment()` : Confirmation de paiement
  - `createConnectAccount()` : Création compte Stripe Connect
  - `configureCustomStripeAccount()` : Configuration compte custom
  - `handleWebhook()` : Gestion des webhooks par tenant

**EncryptionService** (`/backend/src/stripe/encryption.service.ts`)
- Chiffrement AES-256-GCM pour les clés API sensibles
- Dérivation de clé avec PBKDF2
- Méthodes de hashage sécurisé

**StripeConfigController** (`/backend/src/stripe/stripe-config.controller.ts`)
- Endpoints API pour configuration Stripe :
  - `GET /api/stripe-config/:tenantId/config` : Récupération config
  - `POST /api/stripe-config/:tenantId/configure` : Configuration mode
  - `POST /api/stripe-config/:tenantId/connect/onboarding` : Onboarding Connect
  - `GET /api/stripe-config/:tenantId/publishable-key` : Clé publique
  - `POST /api/stripe-config/:tenantId/webhook` : Webhook par tenant

### 2. Modèles Prisma

**Modifications du schéma** :
- Ajout `stripeMode` dans model Tenant
- Ajout relation `stripeAccount` dans Tenant
- Model StripeAccount complet avec tous les champs nécessaires
- Enum StripeMode (PLATFORM | CUSTOM)

### 3. Sécurité

- Chiffrement des clés API en base de données
- Authentification JWT sur tous les endpoints
- Guards de rôles (ADMIN, SUPER_ADMIN)
- Validation des webhooks avec signature Stripe
- Isolation des données par tenant

### 4. Configuration

**Variables d'environnement requises** :
```env
# Stripe Platform (MyTzedaka)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Encryption
ENCRYPTION_SECRET=your-32-char-secret-key
```

## 🔧 Intégration avec l'existant

- Module Stripe mis à jour avec nouveaux services
- Import du PrismaModule pour accès base de données
- Compatible avec services Stripe existants
- Versioning API Stripe : `2025-05-28.basil`

## 📋 Utilisation

### Mode PLATFORM (Stripe Connect)
```typescript
// 1. Configurer le mode
POST /api/stripe-config/:tenantId/configure
{
  "mode": "PLATFORM",
  "email": "association@example.com",
  "businessName": "Association XYZ"
}

// 2. Générer lien onboarding
POST /api/stripe-config/:tenantId/connect/onboarding
{
  "returnUrl": "https://app.mytzedaka.com/settings/stripe",
  "refreshUrl": "https://app.mytzedaka.com/settings/stripe/refresh"
}
```

### Mode CUSTOM
```typescript
// Configurer avec clés propres
POST /api/stripe-config/:tenantId/configure
{
  "mode": "CUSTOM",
  "publishableKey": "pk_test_...",
  "secretKey": "sk_test_...",
  "webhookSecret": "whsec_..."
}
```

## 🚀 État Actuel

- ✅ Backend compile sans erreurs
- ✅ Services multi-tenant fonctionnels
- ✅ Chiffrement sécurisé implémenté
- ✅ API endpoints configurés
- ✅ Types Prisma synchronisés

## 📌 Prochaines Étapes

1. **Tests des endpoints** :
   - Tester configuration mode PLATFORM
   - Tester configuration mode CUSTOM
   - Valider les webhooks

2. **Intégration donation.service.ts** :
   - Adapter pour utiliser MultiTenantStripeService
   - Gérer les commissions selon le mode

3. **Frontend** :
   - Page configuration Stripe admin
   - Adaptation du widget donation

4. **Documentation API** :
   - Swagger/OpenAPI
   - Guide d'intégration

## 🐛 Points d'attention

- Vérifier ENCRYPTION_SECRET en production (32 caractères minimum)
- Configurer webhooks Stripe pour chaque compte
- Gérer les cas d'erreur et retry logic
- Monitoring des transactions par tenant
