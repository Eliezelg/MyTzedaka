# 🚀 Installation Sans Docker

## Option 1 : PostgreSQL + Redis Locaux (Recommandé)

### 1. Installer PostgreSQL
```bash
# Télécharger PostgreSQL depuis : https://www.postgresql.org/download/windows/
# Ou via Chocolatey :
choco install postgresql

# Ou via winget :
winget install PostgreSQL.PostgreSQL
```

### 2. Configurer PostgreSQL
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE platform_dev;
CREATE DATABASE platform_test;

# Créer l'utilisateur
CREATE USER platform_user WITH PASSWORD 'platform_pass';
GRANT ALL PRIVILEGES ON DATABASE platform_dev TO platform_user;
GRANT ALL PRIVILEGES ON DATABASE platform_test TO platform_user;

# Quitter
\q
```

### 3. Installer Redis (Optionnel - on peut s'en passer)
```bash
# Via Chocolatey
choco install redis-64

# Ou télécharger depuis : https://redis.io/download
# Ou utiliser Redis Cloud gratuit : https://redis.com/redis-enterprise-cloud/
```

### 4. Configurer .env
```env
# PostgreSQL local
DATABASE_URL="postgresql://platform_user:platform_pass@localhost:5432/platform_dev"
TEST_DATABASE_URL="postgresql://platform_user:platform_pass@localhost:5432/platform_test"

# Redis local (ou laisser vide pour désactiver)
REDIS_URL="redis://localhost:6379"
# Ou Redis Cloud :
# REDIS_URL="redis://default:password@redis-12345.cloud.redislabs.com:12345"
```

---

## Option 2 : SQLite (Plus Simple pour Débuter)

### 1. Modifier le schéma Prisma
```prisma
// Dans backend/prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Configurer .env
```env
# Base de données SQLite
DATABASE_URL="file:./dev.db"
TEST_DATABASE_URL="file:./test.db"

# Pas de Redis (désactivé)
REDIS_URL=""
```

### 3. Avantages SQLite
- ✅ Aucune installation requise
- ✅ Fichier unique portable
- ✅ Parfait pour développement
- ✅ Migration vers PostgreSQL facile plus tard

---

## Option 3 : Services Cloud Gratuits

### PostgreSQL Cloud
```bash
# Supabase (gratuit) : https://supabase.com
# ElephantSQL (gratuit) : https://www.elephantsql.com
# Neon (gratuit) : https://neon.tech
```

### Redis Cloud
```bash
# Redis Cloud (gratuit 30MB) : https://redis.com
# Upstash (gratuit) : https://upstash.com
```

---

## 🚀 Démarrage Rapide (Sans Docker)

### Avec SQLite (Le plus simple)
```bash
cd backend

# 1. Installer les dépendances
npm install

# 2. Copier et configurer .env
copy .env.example .env
# Éditer .env avec SQLite

# 3. Modifier Prisma pour SQLite
# (voir Option 2 ci-dessus)

# 4. Générer et migrer
npx prisma generate
npx prisma migrate dev --name init

# 5. Démarrer
npm run start:dev
```

### Avec PostgreSQL local
```bash
cd backend

# 1. Installer PostgreSQL (voir Option 1)
# 2. Créer les bases de données
# 3. Configurer .env avec PostgreSQL

# 4. Générer et migrer
npx prisma generate
npx prisma migrate dev --name init

# 5. Démarrer
npm run start:dev
```

---

## 🔧 Configuration Recommandée pour Débuter

Je recommande **SQLite** pour commencer car :
- Installation immédiate
- Pas de configuration
- Migration vers PostgreSQL facile quand tu voudras

### Modifier le backend pour SQLite :
1. Éditer `backend/prisma/schema.prisma`
2. Changer `provider = "postgresql"` vers `provider = "sqlite"`
3. Changer l'URL vers `"file:./dev.db"`

**Veux-tu que je modifie les fichiers pour utiliser SQLite ?** C'est le plus rapide pour commencer !
