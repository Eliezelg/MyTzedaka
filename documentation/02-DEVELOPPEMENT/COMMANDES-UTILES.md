# ⚡ Commandes Utiles - MyTzedaka

**Dernière mise à jour** : 10 juin 2025  
**Environnement** : Windows PowerShell, macOS/Linux Bash

## 🚀 Développement Quotidien

### Démarrage Rapide
```powershell
# Terminal 1 - Backend
cd backend
npm run start:dev         # Port 3000

# Terminal 2 - Frontend  
cd frontend-hub
npm run dev               # Port 3001

# Terminal 3 - Database UI (optionnel)
cd backend
npm run db:studio         # Port 5555
```

### Hot Reloading
```powershell
# Backend avec debug
npm run start:debug       # Port 3000 + debugger 9229

# Frontend avec turbo
npm run dev:turbo         # Next.js optimisé

# Watch files et restart auto
npm run start:watch       # Restart sur changement fichier
```

## 🗄 Base de Données

### Migrations
```powershell
cd backend

# Créer nouvelle migration
npx prisma migrate dev --name add_new_feature

# Appliquer migrations
npx prisma migrate dev

# Reset complet BDD
npx prisma migrate reset --force

# Générer client après modif schema
npx prisma generate
```

### Seed Data
```powershell
# Seed data complète (2 tenants + campagnes)
npm run db:seed

# Reset + seed en une commande
npm run db:reset

# Seed data custom
npx ts-node prisma/seed-custom.ts
```

### Inspection BDD
```powershell
# Interface graphique Prisma Studio
npm run db:studio

# CLI direct PostgreSQL
psql postgresql://user:pass@localhost:5432/mytzedaka_dev

# Backup/Restore
pg_dump mytzedaka_dev > backup.sql
psql mytzedaka_dev < backup.sql
```

## 🧪 Tests

### Tests Backend
```powershell
cd backend

# Tests critiques (isolation tenant)
npm run test:tenant-isolation    # ✅ OBLIGATOIRE

# Tests par module
npm run test:auth               # Authentication
npm run test:hub                # Cross-tenant API
npm run test:admin              # Admin dashboard
npm run test:stripe             # Payment processing

# Tests complets
npm run test:e2e               # Tous les e2e
npm run test                   # Unit tests
npm run test:cov               # Avec coverage
```

### Tests Frontend
```powershell
cd frontend-hub

# Tests composants
npm run test                   # Jest + RTL
npm run test:watch             # Mode watch
npm run test:ui                # Interface graphique

# Tests E2E
npm run test:e2e              # Playwright
npm run test:e2e:headed       # Avec browser visible
npm run test:e2e:ui           # Interface Playwright

# Coverage
npm run test:coverage         # Rapport couverture
```

### Tests Intégration
```powershell
# Full stack test
cd backend && npm run test:e2e &
cd frontend-hub && npm run test:e2e

# Performance test
npm run test:performance      # Load testing
npm run test:lighthouse       # Performance audit
```

## 🔨 Build & Deploy

### Build Local
```powershell
# Backend
cd backend
npm run build                 # Compile TypeScript
npm run start:prod           # Run production build

# Frontend
cd frontend-hub
npm run build                # Next.js build
npm run start                # Serve production
```

### Analyse Bundle
```powershell
cd frontend-hub

# Analyse taille bundle
npm run build
npm run analyze              # Webpack bundle analyzer

# Performance audit
npm run lighthouse           # Lighthouse CI
```

### Docker (Optionnel)
```powershell
# Build images
docker build -t mytzedaka-backend ./backend
docker build -t mytzedaka-frontend ./frontend-hub

# Run avec docker-compose
docker-compose up -d
```

## 🔧 Maintenance

### Cleaning
```powershell
# Clean node_modules
cd backend && rm -rf node_modules && npm install
cd frontend-hub && rm -rf node_modules && npm install

# Clean builds
cd backend && rm -rf dist
cd frontend-hub && rm -rf .next

# Clean database
cd backend && npm run db:reset
```

### Updates
```powershell
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Update Prisma
npx prisma migrate dev
npx prisma generate
```

### Logs
```powershell
# Backend logs (dev)
npm run start:dev | grep ERROR

# Production logs
pm2 logs mytzedaka-backend

# Database logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

## 🐛 Debug & Troubleshooting

### Debug Backend
```powershell
# Debug mode avec VS Code
npm run start:debug
# Attach VS Code debugger sur port 9229

# Logs détaillés
DEBUG=* npm run start:dev

# Profile performance
node --prof --prof-process src/main.js
```

### Debug Frontend
```powershell
# Next.js debug mode
npm run dev:debug

# React DevTools
# Install extension browser + React DevTools

# Bundle analysis
npm run build:analyze
```

### Database Debug
```powershell
# Query logs
echo "log_statement = 'all'" >> postgresql.conf

# Slow queries
echo "log_min_duration_statement = 1000" >> postgresql.conf

# Connection issues
ss -tlnp | grep 5432        # Linux
netstat -an | grep 5432     # Windows
```

## 📊 Monitoring

### Performance
```powershell
# Backend metrics
curl http://localhost:3000/api/metrics

# Frontend metrics
npm run lighthouse:ci

# Database performance
cd backend && npx prisma debug
```

### Health Checks
```powershell
# Backend health
curl http://localhost:3000/api/health

# Database health
pg_isready -h localhost -p 5432

# Frontend health
curl http://localhost:3001/api/health
```

## 🔐 Sécurité

### Audit Dependencies
```powershell
# Audit sécurité
npm audit
npm audit fix

# Check vulnerabilities
npx audit-ci --high

# Update security patches
npm update --depth 1
```

### Secrets Management
```powershell
# Vérifier pas de secrets dans code
git secrets --scan

# Chiffrer variables sensibles
echo "secret" | openssl enc -aes-256-cbc -base64

# Rotation clés Stripe
# Via Stripe Dashboard + update .env
```

## 📋 Git Workflow

### Commits Standards
```powershell
# Commit avec convention
git add .
git commit -m "feat(auth): add Cognito integration

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push avec validation
git push origin feature/auth-integration
```

### Branch Management
```powershell
# Nouvelle feature
git checkout -b feature/nouvelle-feature
git push -u origin feature/nouvelle-feature

# Merge avec main
git checkout main
git merge feature/nouvelle-feature
git push origin main
```

### Release Management
```powershell
# Tag version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Generate changelog
npx conventional-changelog -p angular -r 2
```

## 🚀 Scripts Custom

### Backend Scripts Avancés
```powershell
# Script seed data custom
npx ts-node scripts/seed-production-data.ts

# Migration custom
npx ts-node scripts/custom-migration.ts

# Backup automatique
npx ts-node scripts/backup-database.ts
```

### Frontend Scripts Avancés
```powershell
# Generate components
npx plop component ComponentName

# Optimize images
npx next-optimized-images

# Generate sitemap
npm run build:sitemap
```

## 📊 Utilitaires Développement

### Code Quality
```powershell
# Lint code
cd backend && npm run lint
cd frontend-hub && npm run lint

# Format code
cd backend && npm run format
cd frontend-hub && npm run format

# Type checking
cd backend && npx tsc --noEmit
cd frontend-hub && npm run type-check
```

### Documentation
```powershell
# Generate API docs
cd backend && npm run docs:generate

# Serve docs
cd backend && npm run docs:serve

# Update OpenAPI
cd backend && npm run swagger:generate
```

## 🎯 Scripts par Contexte

### Développement Feature
```powershell
# Setup nouvelle feature
git checkout -b feature/mon-feature
cd backend && npm run test:watch &
cd frontend-hub && npm run dev &
code .
```

### Debug Production Issue
```powershell
# Logs production
pm2 logs --lines 100
docker logs mytzedaka-backend

# Database check
cd backend && npm run db:check-health
psql -c "SELECT pg_size_pretty(pg_database_size('mytzedaka_prod'));"

# Performance profiling  
cd backend && npm run profile:start
```

### Release Preparation
```powershell
# Pre-release checklist
npm run test:all
npm run build
npm run lighthouse:ci
npm audit
git status

# Release
npm version patch
git push --tags
npm run deploy:staging
```

## 📱 Mobile Development (Future)
```powershell
# React Native setup (planifié)
npx react-native init MyTzedakaMobile
cd MyTzedakaMobile && npm install

# Expo setup (alternatif)
npx create-expo-app MyTzedakaExpo
cd MyTzedakaExpo && npm start
```

---

## 💡 Tips & Tricks

### Performance
- Use `npm run start:dev -- --watch` pour reload intelligent
- `NODE_OPTIONS="--max-old-space-size=8192"` pour gros builds
- `npm run build:analyze` pour optimiser bundle size

### Productivité
- Alias git : `git config --global alias.cm "commit -m"`
- VS Code settings sync pour équipe cohérente
- `npm run dev:all` pour démarrer backend + frontend

### Debug
- `console.time('operation')` + `console.timeEnd('operation')`
- Chrome DevTools Network tab pour API calls
- Prisma Studio pour inspection data rapide

**Ces commandes couvrent 95% des besoins quotidiens de développement !** ⚡