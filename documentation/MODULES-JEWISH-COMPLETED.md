# Modules Jewish Complétés

## Vue d'ensemble
Les trois modules principaux pour les communautés juives ont été entièrement implémentés :
- **Module Zmanim** : Calcul et affichage des temps halakhiques
- **Module Prières** : Gestion des horaires de prières avec calculs dynamiques
- **Module Parnass** : Système de sponsoring communautaire

## 1. Module Zmanim ✅

### Backend
- **Service** : `/backend/src/tenant/zmanim.service.ts`
- **Controller** : `/backend/src/tenant/zmanim.controller.ts`
- **Modèle Prisma** : `ZmanimSettings`
- **Librairie** : kosher-zmanim (calculs astronomiques précis)

### Fonctionnalités
- Calcul automatique basé sur la localisation (latitude/longitude)
- Support de plusieurs méthodes de calcul (NOAA, USNO, etc.)
- Configuration par tenant des Zmanim à afficher
- Format 24h ou 12h avec secondes optionnelles
- Dates hébraïques et Parasha de la semaine
- Villes prédéfinies (Paris, Jérusalem, Tel Aviv, etc.)

### API Endpoints
- `GET /api/tenant/:tenantId/zmanim/today` - Zmanim du jour
- `GET /api/tenant/:tenantId/zmanim/date/:date` - Zmanim pour une date
- `GET /api/tenant/:tenantId/zmanim/settings` - Paramètres
- `PUT /api/tenant/:tenantId/zmanim/settings` - Mise à jour paramètres

### Frontend
- **Widget** : `/frontend-hub/src/components/sites/jewish/ZmanimWidget.tsx` (347 lignes)
- **Admin** : `/frontend-hub/src/components/sites/admin/ZmanimManager.tsx`

## 2. Module Prières ✅

### Backend
- **Service** : `/backend/src/tenant/prayers.service.ts`
- **Controller** : `/backend/src/tenant/prayers.controller.ts`
- **Modèles Prisma** : `PrayerSettings`, `PrayerSchedule`

### Modes de calcul Shaharit
- **FIXED** : Heure fixe configurée
- **BEFORE_NETZ** : X minutes avant le lever (Vatikin)
- **AFTER_NETZ** : X minutes après le lever
- **BEFORE_SHEMA_GRA** : X minutes avant fin Shema (GRA)
- **BEFORE_SHEMA_MGA** : X minutes avant fin Shema (Magen Avraham)

### Modes de calcul Minha
- **FIXED** : Heure fixe
- **BEFORE_SHKIA** : X minutes avant le coucher
- **ZMANIM_BASED** : Basé sur Minha Ketana/Gedola

### Modes de calcul Arvit
- **FIXED** : Heure fixe
- **AFTER_SHKIA** : X minutes après le coucher
- **AFTER_TZET** : X minutes après Tzet Hakochavim

### Fonctionnalités spéciales
- Arrondi des horaires (5 ou 10 minutes)
- Horaires différents pour Shabbat/Yom Tov
- Support des Selichot (période pré-Rosh Hashana)
- Génération automatique de planning sur 30 jours
- Notifications configurables

### API Endpoints
- `GET /api/tenant/:tenantId/prayers/today` - Horaires du jour
- `GET /api/tenant/:tenantId/prayers/weekly` - Planning hebdomadaire
- `GET /api/tenant/:tenantId/prayers/monthly/:year/:month` - Planning mensuel
- `GET /api/tenant/:tenantId/prayers/settings` - Paramètres
- `PUT /api/tenant/:tenantId/prayers/settings` - Mise à jour
- `POST /api/tenant/:tenantId/prayers/generate` - Générer planning

### Frontend
- **Widget** : `/frontend-hub/src/components/sites/jewish/PrayersWidget.tsx`
- **Admin** : `/frontend-hub/src/components/sites/admin/PrayersManager.tsx`

## 3. Module Parnass ✅

### Backend
- **Service** : `/backend/src/parnass/parnass.service.ts`
- **Controller** : `/backend/src/parnass/parnass.controller.ts`
- **Controller Public** : `/backend/src/tenant/parnass.controller.ts`
- **Module** : `/backend/src/parnass/parnass.module.ts`
- **Modèles Prisma** : `ParnassSponsor`, `ParnassSettings`

### Types de sponsoring
- **DAILY** : Parnass HaYom (100€ par défaut)
- **MONTHLY** : Parnass HaChodesh (500€ par défaut)
- **YEARLY** : Parnass HaShana (1800€ par défaut)

### Types de dédicaces
- **IN_MEMORY** : לעילוי נשמת (À la mémoire de)
- **FOR_HEALING** : לרפואה שלמה (Pour la guérison)
- **FOR_SUCCESS** : להצלחת (Pour la réussite)
- **IN_HONOR** : לכבוד (En l'honneur)
- **FOR_MERIT** : לזכות (Pour le mérite)

### Fonctionnalités
- Sponsors multiples ou uniques par date
- Approbation manuelle ou automatique
- Messages personnalisés et dédicaces
- Support anonyme
- Priorité d'affichage et mise en avant
- Statistiques et rapports
- Nettoyage automatique des sponsors expirés
- Intégration avec le système de donations

### API Endpoints Admin
- `GET /api/admin/tenants/:tenantId/parnass` - Liste des sponsors
- `GET /api/admin/tenants/:tenantId/parnass/settings` - Paramètres
- `PUT /api/admin/tenants/:tenantId/parnass/settings` - Mise à jour
- `POST /api/admin/tenants/:tenantId/parnass` - Créer sponsor
- `PATCH /api/admin/tenants/:tenantId/parnass/:id` - Modifier
- `DELETE /api/admin/tenants/:tenantId/parnass/:id` - Supprimer
- `POST /api/admin/tenants/:tenantId/parnass/:id/approve` - Approuver
- `POST /api/admin/tenants/:tenantId/parnass/:id/reject` - Rejeter
- `GET /api/admin/tenants/:tenantId/parnass/statistics` - Statistiques
- `POST /api/admin/tenants/:tenantId/parnass/cleanup` - Nettoyer expirés

### API Endpoints Public
- `GET /api/tenant/:tenantId/parnass/current` - Sponsors actuels
- `GET /api/tenant/:tenantId/parnass/available-dates` - Dates disponibles
- `GET /api/tenant/:tenantId/parnass/settings` - Paramètres publics
- `POST /api/tenant/:tenantId/parnass/sponsor` - Demande de sponsoring

### Frontend
- **Widget** : `/frontend-hub/src/components/sites/jewish/ParnassWidget.tsx`
- **Admin** : `/frontend-hub/src/components/sites/admin/ParnassManager.tsx`

## Interface Admin

### Localisation
`/sites/[domain]/admin`

### Nouveaux onglets ajoutés
1. **Zmanim** : Configuration de la localisation et des temps à afficher
2. **Prières** : Gestion des modes de calcul et horaires
3. **Parnass** : Gestion des sponsors et paramètres

### Accès
- Connexion requise avec rôle ADMIN ou MANAGER
- Email: eliezelg@gmail.com
- Mot de passe: Grenoble10@

## Scripts de test

### Test Zmanim
```bash
./test-zmanim.sh
```

### Test Prières
```bash
./test-prayers.sh
```

### Test modes Shaharit
```bash
./test-shaharit-modes.sh
```

### Test Parnass
```bash
./test-parnass.sh
```

## Base de données

### Migration appliquée
- `20250821123613_add_parnass_module` - Ajout des tables Parnass

### Tables créées
- `zmanim_settings` - Configuration Zmanim par tenant
- `prayer_settings` - Configuration prières par tenant
- `prayer_schedules` - Planning des prières
- `parnass_sponsors` - Sponsors Parnass
- `parnass_settings` - Configuration Parnass par tenant

## Points techniques importants

### Multi-tenant
- Isolation stricte des données par `tenantId`
- Configuration indépendante par communauté
- Support des utilisateurs globaux (hub)

### Intégration
- Modules activables/désactivables via `TenantModules`
- Intégration avec le système de paiement Stripe
- Lien avec le système de donations existant

### Performance
- Cache des calculs Zmanim
- Planning pré-généré pour les prières
- Requêtes optimisées avec indexes Prisma

## Prochaines étapes suggérées

1. **Tests E2E** : Créer des tests automatisés complets
2. **Notifications** : Implémenter l'envoi de rappels de prières
3. **Calendrier juif** : Ajouter les fêtes et événements
4. **Export PDF** : Planning mensuel téléchargeable
5. **API mobile** : Pour application mobile communautaire
6. **Intégration Stripe** : Finaliser le paiement Parnass
7. **Dashboard analytics** : Statistiques détaillées
8. **Multi-langue** : Support hébreu complet