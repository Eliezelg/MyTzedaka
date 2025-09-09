# 🛠 Setup Environnement - MyTzedaka

**Version** : 1.0  
**Dernière mise à jour** : 10 juin 2025  
**Testé sur** : Windows 11, macOS, Ubuntu 22.04

## 📋 Prérequis

### Outils Obligatoires
```bash
Node.js 20+ (LTS recommandé)
npm 10+
Git 2.40+
PostgreSQL 15+
```

### Comptes Requis
- **AWS Account** : Pour Cognito (auth) et S3 (files)
- **Stripe Account** : Pour payments (test + production)
- **GitHub Account** : Pour repository access

### IDE Recommandé
- **VS Code** avec extensions :
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

## 🚀 Installation Rapide

### 1. Clone du Repository
```bash
git clone https://github.com/votre-org/mytzedaka.git
cd mytzedaka
```

### 2. Installation Backend
```bash
cd backend
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos credentials (voir section Variables)

# Base de données
npx prisma migrate dev
npx prisma db seed

# Test installation
npm run start:dev
# ✅ Backend accessible sur http://localhost:3000
```

### 3. Installation Frontend
```bash
cd ../frontend-hub
npm install

# Configuration environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos URLs (voir section Variables)

# Test installation
npm run dev
# ✅ Frontend accessible sur http://localhost:3001
```

### 4. Validation Installation
```bash
# Backend - Tests critiques
cd backend
npm run test:tenant-isolation  # Doit passer ✅
npm run test:auth              # Doit passer ✅

# Frontend - Build verification
cd ../frontend-hub
npm run build                  # Doit compiler sans erreur ✅
npm run type-check             # Doit valider TypeScript ✅
```

## 🔐 Variables d'Environnement

### Backend (.env)
```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/mytzedaka_dev"

# AWS Cognito (Auth)
AWS_REGION="eu-west-1"
AWS_COGNITO_USER_POOL_ID="eu-west-1_xxxxxxxxx"
AWS_COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# JWT Secret
JWT_SECRET="your-256-bit-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxx"  # Test key
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxx"

# Encryption (pour clés Stripe multi-tenant)
ENCRYPTION_SECRET="32-char-hex-key-for-aes-256-encryption"

# Environment
NODE_ENV="development"
PORT="3000"

# Optional - S3 pour uploads
AWS_S3_BUCKET="mytzedaka-dev-uploads"
AWS_S3_REGION="eu-west-1"
```

### Frontend (.env.local)
```bash
# API Backend
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Stripe Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxx"

# Environment
NEXT_PUBLIC_ENV="development"
```

## 🗄 Configuration Base de Données

### PostgreSQL Local
```bash
# Installation PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (avec Homebrew)
brew install postgresql
brew services start postgresql

# Windows - Télécharger depuis postgresql.org

# Création base de données
sudo -u postgres psql
CREATE DATABASE mytzedaka_dev;
CREATE USER mytzedaka_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mytzedaka_dev TO mytzedaka_user;
\q
```

### Migration et Seed
```bash
cd backend

# Génération client Prisma
npx prisma generate

# Application migrations
npx prisma migrate dev

# Seed data (2 tenants + campagnes + donations)
npx prisma db seed

# Vérification données
npx prisma studio  # Interface web sur http://localhost:5555
```

## ☁️ Configuration AWS

### Cognito User Pool
1. **Créer User Pool** :
   - Nom : `mytzedaka-dev`
   - Sign-in options : Email
   - Password policy : Default

2. **App Client** :
   - Type : Public client
   - Authentication flows : `ADMIN_NO_SRP_AUTH`, `USER_PASSWORD_AUTH`
   - No client secret

3. **Noter les IDs** dans .env :
   ```bash
   AWS_COGNITO_USER_POOL_ID="eu-west-1_xxxxxxxxx"
   AWS_COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### S3 Bucket (Optionnel)
```bash
# CLI AWS
aws s3 mb s3://mytzedaka-dev-uploads --region eu-west-1

# Politique CORS
aws s3api put-bucket-cors --bucket mytzedaka-dev-uploads --cors-configuration file://cors.json
```

## 💳 Configuration Stripe

### Test Environment
1. **Créer compte** Stripe (mode test)
2. **Récupérer clés** : Dashboard → Developers → API keys
3. **Configurer webhook** : `http://localhost:3000/api/stripe/webhook`
   - Événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

### Cartes de Test
```bash
# Succès
4242 4242 4242 4242  (Visa)
5555 5555 5555 4444  (Mastercard)

# Échec
4000 0000 0000 0002  (Declined)
4000 0000 0000 9995  (Insufficient funds)

# Expiration : Toute date future
# CVC : Tout code 3 chiffres
```

## 🧪 Tests et Validation

### Tests Backend Critiques
```bash
cd backend

# Isolation tenant (CRITIQUE)
npm run test:tenant-isolation
# ✅ Doit passer - Vérifie séparation données

# Authentication
npm run test:auth
# ✅ Doit passer - JWT et Cognito

# Hub Central
npm run test:hub
# ✅ Doit passer - API cross-tenant

# Admin
npm run test:admin
# ✅ Doit passer - CRUD tenants
```

### Tests Frontend
```bash
cd frontend-hub

# Build sans erreur
npm run build
# ✅ Compilation Next.js réussie

# Types TypeScript
npm run type-check
# ✅ 0 erreur TypeScript

# Tests unitaires
npm run test
# ✅ Composants principaux
```

### Tests Manuels
1. **Backend API** :
   ```bash
   curl http://localhost:3000/api/health
   # ✅ {"status": "ok"}
   
   curl http://localhost:3000/api/hub/associations
   # ✅ Liste associations
   ```

2. **Frontend Pages** :
   - http://localhost:3001 → Homepage ✅
   - http://localhost:3001/associations → Directory ✅
   - http://localhost:3001/login → Auth ✅

## 🔧 Troubleshooting

### Erreurs Courantes

#### "Cannot connect to database"
```bash
# Vérifier PostgreSQL running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Vérifier connection string
psql "postgresql://user:password@localhost:5432/mytzedaka_dev"
```

#### "Prisma Client not generated"
```bash
cd backend
npx prisma generate
npm run start:dev
```

#### "Tenant context not found"
```bash
# Vérifier header X-Tenant-ID ou route /api/tenant/xxx
curl -H "X-Tenant-ID: test-tenant" http://localhost:3000/api/tenant/test-tenant/campaigns
```

#### Frontend build errors
```bash
cd frontend-hub
rm -rf .next node_modules
npm install
npm run build
```

### Performance Issues
```bash
# Backend - Memory
NODE_OPTIONS="--max-old-space-size=4096" npm run start:dev

# Frontend - Build optimization
NEXT_PUBLIC_ANALYZE=true npm run build
```

## 🚀 Scripts Utiles

### Backend Development
```bash
cd backend

# Développement avec hot reload
npm run start:dev

# Build production
npm run build

# Tests complets
npm run test:all

# Reset BDD complète
npm run db:reset

# Prisma Studio (interface graphique)
npm run db:studio
```

### Frontend Development
```bash
cd frontend-hub

# Développement avec hot reload
npm run dev

# Build production
npm run build

# Analyse bundle
npm run build && npm run analyze

# Tests avec watch
npm run test:watch
```

## 📊 Structure Projet

```
mytzedaka/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── tenant/            # Multi-tenant core
│   │   ├── auth/              # Authentication
│   │   ├── hub/               # Cross-tenant API
│   │   ├── stripe/            # Payment processing
│   │   └── admin/             # Admin dashboard
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # DB migrations
│   └── test/                  # E2E tests
│
├── frontend-hub/              # Frontend Next.js
│   ├── src/
│   │   ├── app/              # Next.js 13+ App Router
│   │   ├── components/        # UI components
│   │   ├── lib/              # Utilities & API client
│   │   └── hooks/            # Custom React hooks
│   └── public/               # Static assets
│
├── documentation/             # Documentation technique
└── CLAUDE.md                 # Guide pour IA
```

## ✅ Checklist Setup Complet

### Environnement
- [ ] Node.js 20+ installé
- [ ] PostgreSQL 15+ configuré
- [ ] Variables .env configurées
- [ ] AWS Cognito setup
- [ ] Stripe test account

### Backend
- [ ] `npm install` sans erreur
- [ ] `npx prisma migrate dev` appliqué
- [ ] `npm run test:tenant-isolation` passe ✅
- [ ] API accessible http://localhost:3000

### Frontend
- [ ] `npm install` sans erreur
- [ ] `npm run build` compile ✅
- [ ] App accessible http://localhost:3001
- [ ] Login/signup fonctionnel

### Intégration
- [ ] Frontend peut appeler backend API
- [ ] Authentication Cognito marche
- [ ] Stripe test payment fonctionne
- [ ] Tests e2e passent

**Une fois cette checklist validée, votre environnement est prêt pour le développement !** 🎉