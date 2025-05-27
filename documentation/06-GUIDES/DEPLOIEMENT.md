# 🚀 Guide de Déploiement de MyTzedaka

## 📋 Prérequis

Avant de déployer MyTzedaka en production, assurez-vous de disposer des éléments suivants :

### Infrastructure
- Un compte AWS avec les services suivants :
  - AWS Cognito (authentification)
  - AWS RDS (PostgreSQL)
  - AWS S3 (stockage fichiers/médias)
  - AWS CloudFront (CDN)
  - AWS Lambda (fonctions serverless)
  - AWS EC2 ou ECS (containers)
- Noms de domaine pour :
  - Hub central : `mytzedaka.com`
  - API : `api.mytzedaka.com`
  - Tenants : `*.mytzedaka.com`

### Secrets et Clés API
- Clé API Stripe (production)
- Secrets OAuth (AWS Cognito)
- Clés S3 (accès sécurisé)
- Certificats SSL (pour tous les domaines)
- Variables d'environnement de production

## 🔄 Procédure de Déploiement

### 1. Préparation de la Base de Données

```bash
# Se connecter à PostgreSQL
psql -h <PROD_DB_HOST> -U <PROD_DB_USER> -d postgres

# Créer la base de données de production
CREATE DATABASE mytzedaka_prod;

# Sortir de psql
\q

# Migrer la structure avec Prisma
cd backend
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/mytzedaka_prod" npx prisma migrate deploy
```

### 2. Déploiement du Backend

```bash
# Construction du backend
cd backend
npm run build

# Créer un fichier .env.production
cat > .env.production << EOF
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/mytzedaka_prod"
JWT_SECRET="<YOUR_SECURE_JWT_SECRET>"
AWS_REGION="eu-west-3"
AWS_COGNITO_USER_POOL_ID="<YOUR_COGNITO_POOL_ID>"
AWS_COGNITO_CLIENT_ID="<YOUR_COGNITO_CLIENT_ID>"
STRIPE_API_KEY="<YOUR_STRIPE_API_KEY>"
STRIPE_WEBHOOK_SECRET="<YOUR_STRIPE_WEBHOOK_SECRET>"
S3_BUCKET_NAME="mytzedaka-prod-assets"
EOF

# Déployer sur EC2/ECS avec PM2
pm2 deploy production
```

### 3. Déploiement du Frontend

```bash
# Construction du frontend
cd frontend-hub
npm run build

# Créer un fichier .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL="https://api.mytzedaka.com"
NEXT_PUBLIC_COGNITO_REGION="eu-west-3"
NEXT_PUBLIC_COGNITO_USER_POOL_ID="<YOUR_COGNITO_POOL_ID>"
NEXT_PUBLIC_COGNITO_CLIENT_ID="<YOUR_COGNITO_CLIENT_ID>"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<YOUR_STRIPE_PUBLISHABLE_KEY>"
EOF

# Déployer sur Vercel
vercel --prod
```

### 4. Configuration CDN et SSL

```bash
# Configurer CloudFront pour le frontend
aws cloudfront create-distribution \
  --origin-domain-name <VERCEL_DOMAIN> \
  --default-root-object index.html \
  --aliases mytzedaka.com www.mytzedaka.com

# Configurer les certificats SSL
aws acm request-certificate \
  --domain-name mytzedaka.com \
  --validation-method DNS \
  --subject-alternative-names *.mytzedaka.com api.mytzedaka.com
```

### 5. Configuration Multi-tenant

```bash
# Pour chaque nouveau tenant
cd scripts
./create-tenant.sh <TENANT_NAME> <TENANT_DOMAIN>
```

## 🔍 Vérifications Post-Déploiement

### Contrôles de Base
- [ ] L'API répond sur `https://api.mytzedaka.com/health`
- [ ] Le frontend charge sur `https://mytzedaka.com`
- [ ] La connexion utilisateur fonctionne
- [ ] Les assets S3 sont correctement servis

### Contrôles Avancés
- [ ] Les webhooks Stripe reçoivent des événements
- [ ] Les pages tenant se chargent correctement
- [ ] Les transactions fonctionnent bout-en-bout
- [ ] Les métriques CloudWatch sont activées

## 📈 Surveillance et Maintenance

### Outils de Monitoring
- **Sentry** : Suivi des erreurs frontend/backend
- **CloudWatch** : Métriques infrastructure AWS
- **Datadog** : APM et dashboards complets
- **Uptime Robot** : Surveillance disponibilité API/frontend

### Procédure de Mise à Jour
```bash
# 1. Tester en staging
./deploy-staging.sh <VERSION>

# 2. Valider les tests
npm run test:e2e

# 3. Déployer en production
./deploy-production.sh <VERSION>

# 4. Vérifier les métriques post-déploiement
./check-deployment-health.sh
```

## 🚨 Gestion des Incidents

### Procédure de Rollback
```bash
# En cas de problème critique
./rollback-production.sh <PREVIOUS_VERSION>
```

### Contacts d'Urgence
- **DevOps** : devops@mytzedaka.com / +33 6 XX XX XX XX
- **Backend** : backend-team@mytzedaka.com
- **Frontend** : frontend-team@mytzedaka.com
- **Support Client** : support@mytzedaka.com

## 🛡️ Sécurité et Conformité

### Sauvegardes
- Base de données : Sauvegardes automatiques quotidiennes
- Assets S3 : Réplication cross-region
- Code : Historique Git complet

### Conformité
- RGPD : Export/suppression données utilisateurs
- PCI DSS : Conformité paiements (via Stripe)
- Accessibilité : WCAG 2.1 AA minimum

---

*Document créé le 27 mai 2025*  
*Dernière mise à jour : 27 mai 2025*
