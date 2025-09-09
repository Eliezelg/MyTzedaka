# 🚀 Plan d'Exécution - Phase 3 Multi-Tenant

## 📅 Planning Global : 8-10 Jours

### Vue d'Ensemble
- **Durée totale estimée**: 8-10 jours
- **Effort principal**: Backend (60%), Intégration (30%), Tests (10%)
- **Risques**: Faibles - Architecture déjà en place
- **ROI**: Très élevé - Débloque toutes les fonctionnalités custom

---

## 📋 Sprint 1 : Core Modules System (2 jours)

### Jour 1 : Modèles et Migrations

#### Matin (4h)
1. **Ajouter TenantModules au schema.prisma**
```bash
cd backend
# Éditer prisma/schema.prisma
# Ajouter model TenantModules
```

2. **Créer migration**
```bash
npm run db:migrate -- --name add_tenant_modules
```

3. **Seed data pour tests**
```bash
# Ajouter dans prisma/seed.ts
# Modules par défaut pour chaque tenant
npm run db:seed
```

#### Après-midi (4h)
1. **Créer TenantModulesService**
```typescript
// backend/src/tenant/tenant-modules.service.ts
- getModules(tenantId)
- updateModules(tenantId, modules)
- isModuleEnabled(tenantId, moduleName)
- getModuleConfig(tenantId, moduleName)
- updateModuleConfig(tenantId, moduleName, config)
```

2. **Créer DTOs**
```typescript
// backend/src/tenant/dto/tenant-modules.dto.ts
- UpdateModulesDto
- ModuleConfigDto
```

### Jour 2 : API et Intégration Frontend

#### Matin (4h)
1. **Implémenter endpoints dans TenantController**
```typescript
@Get(':id/modules')
@Put(':id/modules')
@Get(':id/modules/:moduleName/config')
@Put(':id/modules/:moduleName/config')
```

2. **Tests Postman/Swagger**
- Valider tous les endpoints
- Documenter dans Swagger

#### Après-midi (4h)
1. **Connecter ModulesManager au backend**
```typescript
// frontend-hub/src/components/sites/admin/ModulesManager.tsx
- Remplacer données mockées
- Appels API réels
- Gestion des erreurs
```

2. **Tester flow complet**
- Activer/désactiver modules
- Vérifier navigation dynamique
- Valider persistence

**✅ Livrable Sprint 1**: Système de modules fonctionnel

---

## 📋 Sprint 2 : Parnass Integration (2 jours)

### Jour 3 : Backend Parnass

#### Matin (4h)
1. **Fusionner schema Parnass**
```bash
# Copier modèles de schema-parnass.prisma vers schema.prisma
# Ajuster relations
npm run db:migrate -- --name add_parnass_models
```

2. **Créer ParnassService**
```typescript
// backend/src/parnass/parnass.service.ts
- getAvailableDates(tenantId, year, month)
- bookDate(tenantId, booking)
- getBookings(tenantId, filters)
- cancelBooking(bookingId)
- generateCertificate(bookingId)
```

#### Après-midi (4h)
1. **Compléter ParnassController**
```typescript
// Remplacer TODOs par implémentation réelle
@Get('available')
@Post('book')
@Get('bookings')
@Delete('bookings/:id')
@Get('certificates/:id')
```

2. **Tests unitaires**
```bash
npm run test:unit parnass
```

### Jour 4 : Frontend Parnass

#### Matin (4h)
1. **Connecter ParnassManager**
```typescript
// frontend-hub/src/components/sites/admin/ParnassManager.tsx
- API calls réels
- Gestion état avec React Query
```

2. **Intégrer calendrier de réservation**
```typescript
// frontend-hub/src/components/sites/parnass/ParnassCalendar.tsx
- Affichage disponibilités
- Flow de réservation
```

#### Après-midi (4h)
1. **Page publique Parnass**
```typescript
// frontend-hub/src/app/sites/[domain]/parnass/page.tsx
- Calendrier public
- Formulaire réservation
- Paiement Stripe
```

2. **Tests E2E**
```bash
# Flow complet réservation
npm run test:e2e parnass
```

**✅ Livrable Sprint 2**: Système Parnass opérationnel

---

## 📋 Sprint 3 : Synagogue Features (3-4 jours)

### Jour 5 : Modèles Synagogue

#### Matin (4h)
1. **Ajouter modèles au schema**
```prisma
model SynagogueSettings { ... }
model Prayer { ... }
model Course { ... }
model Room { ... }
```

2. **Migration et seed**
```bash
npm run db:migrate -- --name add_synagogue_models
npm run db:seed
```

#### Après-midi (4h)
1. **Créer SynagogueService**
```typescript
// backend/src/synagogue/synagogue.service.ts
- getSettings(tenantId)
- updateSettings(tenantId, settings)
- getPrayers(tenantId)
- createPrayer(tenantId, prayer)
- getCourses(tenantId)
- createCourse(tenantId, course)
```

### Jour 6 : Zmanim Integration

#### Matin (4h)
1. **Installer KosherZmanim**
```bash
cd frontend-hub
npm install kosher-zmanim
```

2. **Créer ZmanimService**
```typescript
// frontend-hub/src/lib/services/zmanim.service.ts
- Import depuis documentation
- Adapter pour Next.js
```

#### Après-midi (4h)
1. **Intégrer dans composants**
```typescript
// frontend-hub/src/components/sites/jewish/ZmanimWidget.tsx
- Utiliser ZmanimService
- Affichage responsive
- Configuration par tenant
```

2. **Tests composants**
```bash
npm run test:components zmanim
```

### Jour 7 : Prayers & Courses

#### Matin (4h)
1. **API Synagogue**
```typescript
// backend/src/synagogue/synagogue.controller.ts
@Get('settings')
@Put('settings')
@Get('prayers')
@Post('prayers')
@Get('courses')
@Post('courses')
```

2. **Frontend admin**
```typescript
// Créer interface admin pour prayers/courses
- CRUD prayers
- CRUD courses
- Gestion rooms
```

#### Après-midi (4h)
1. **Pages publiques**
```typescript
// frontend-hub/src/app/sites/[domain]/synagogue/
- /zmanim/page.tsx
- /prayers/page.tsx
- /courses/page.tsx
```

2. **Tests intégration**
```bash
npm run test:integration synagogue
```

### Jour 8 (Optionnel) : Finitions Synagogue

#### Matin (4h)
1. **Calendrier hébraïque**
- Intégration dates juives
- Affichage fêtes

2. **Optimisations**
- Cache zmanim
- Performance

**✅ Livrable Sprint 3**: Features synagogue complètes

---

## 📋 Sprint 4 : Finition & Tests (2-3 jours)

### Jour 9 : Nettoyage & Optimisation

#### Matin (4h)
1. **Cleanup code**
```bash
# Supprimer TODOs
grep -r "TODO" backend/src
grep -r "TODO" frontend-hub/src

# Supprimer code legacy Cognito
rm -rf backend/src/auth/strategies/cognito.strategy.ts
```

2. **Standardiser réponses API**
```typescript
// Créer interceptor global
// Format uniforme réponses
```

#### Après-midi (4h)
1. **Optimisations performance**
- Indexes base de données
- React.memo sur composants lourds
- Lazy loading routes

2. **Documentation API**
```bash
# Compléter Swagger
npm run swagger:generate
```

### Jour 10 : Tests & Validation

#### Matin (4h)
1. **Tests unitaires**
```bash
cd backend
npm run test:unit
npm run test:coverage
```

2. **Tests E2E critiques**
```bash
npm run test:e2e signup
npm run test:e2e tenant-isolation
npm run test:e2e modules
```

#### Après-midi (4h)
1. **Tests manuels**
- Flow signup complet
- Activation modules
- Personnalisation thème
- Parnass booking
- Zmanim display

2. **Bug fixes**
- Corriger issues trouvées
- Retester

**✅ Livrable Sprint 4**: Système stable et testé

---

## 🛠️ Commandes Utiles

### Backend
```bash
# Development
cd backend
npm run start:dev

# Database
npm run db:migrate
npm run db:seed
npm run db:studio

# Tests
npm run test
npm run test:watch
npm run test:coverage
```

### Frontend
```bash
# Development
cd frontend-hub
npm run dev

# Build
npm run build
npm run start

# Tests
npm run test
npm run test:e2e
```

### Git Workflow
```bash
# Nouvelle branche par sprint
git checkout -b feature/sprint-1-modules

# Commit après chaque task
git add .
git commit -m "feat: Add TenantModules model and service"

# PR à la fin du sprint
gh pr create --title "Sprint 1: Core Modules System"
```

---

## 📊 Métriques de Succès

### Sprint 1 (Modules)
- [ ] TenantModules model créé
- [ ] API modules fonctionnelle
- [ ] ModulesManager connecté
- [ ] Navigation dynamique OK

### Sprint 2 (Parnass)
- [ ] Schema Parnass fusionné
- [ ] API Parnass complète
- [ ] Flow réservation testé
- [ ] Paiement intégré

### Sprint 3 (Synagogue)
- [ ] Modèles synagogue créés
- [ ] KosherZmanim intégré
- [ ] Zmanim Widget fonctionnel
- [ ] Prayers/Courses CRUD OK

### Sprint 4 (Finition)
- [ ] Code cleanup fait
- [ ] Tests > 80% coverage
- [ ] Documentation complète
- [ ] 0 bugs critiques

---

## 🚨 Points d'Attention

### Risques Techniques
1. **Migration données** - Tester sur copie DB
2. **Breaking changes** - Versionner API
3. **Performance** - Monitorer requêtes lourdes

### Dépendances
1. **KosherZmanim** - Vérifier compatibilité Next.js
2. **Stripe** - Tester webhooks en local
3. **TypeScript** - Maintenir types synchronisés

### Sécurité
1. **Tenant isolation** - Tests rigoureux
2. **API keys** - Toujours chiffrées
3. **CORS** - Configuration stricte production

---

## 📈 Suivi Quotidien

### Template Daily Standup
```markdown
## Jour X - [Date]

### ✅ Complété hier
- Task 1
- Task 2

### 🎯 Objectifs aujourd'hui
- Task 3
- Task 4

### 🚧 Blockers
- Issue 1

### 📊 Progress
- Sprint: X/4
- Tasks: X/Y
- Coverage: X%
```

---

## 🎯 Definition of Done

### Pour chaque feature
- [ ] Code implémenté
- [ ] Tests écrits (>80% coverage)
- [ ] Documentation mise à jour
- [ ] Code review passée
- [ ] Testé manuellement
- [ ] Pas de regression
- [ ] Mergé dans main

### Pour chaque sprint
- [ ] Tous les tickets fermés
- [ ] Demo au stakeholder
- [ ] Retrospective faite
- [ ] Documentation à jour
- [ ] Métriques atteintes

---

## 🏁 Livraison Finale

### Checklist Production
- [ ] Tous les sprints complétés
- [ ] Tests E2E passent
- [ ] Performance validée
- [ ] Sécurité auditée
- [ ] Documentation complète
- [ ] Formation utilisateurs
- [ ] Plan de rollback
- [ ] Monitoring configuré

### Métriques Finales Attendues
- **Couverture code**: >80%
- **Performance**: <2s chargement
- **Disponibilité**: 99.9%
- **Bugs critiques**: 0
- **User satisfaction**: >4.5/5

---

## 💡 Tips pour l'Exécution

1. **Commencer par le plus critique** - Modules system débloque tout
2. **Tester au fur et à mesure** - Pas de dette technique
3. **Documenter immédiatement** - Pas après
4. **Communiquer les blockers** - Rapidement
5. **Célébrer les victoires** - Motivation équipe

---

## 📞 Support & Escalation

### Contacts Techniques
- **Backend Lead**: Pour architecture NestJS
- **Frontend Lead**: Pour composants React
- **DevOps**: Pour infrastructure
- **Security**: Pour audit sécurité

### Resources
- [Documentation NestJS](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [KosherZmanim](https://github.com/BehindTheMath/KosherZmanim)

---

**🎉 Bonne chance pour l'implémentation!**

Ce plan détaillé permet une exécution méthodique avec des livrables clairs à chaque étape. L'équipe peut suivre ce guide jour par jour pour compléter la Phase 3 avec succès.