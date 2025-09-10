# Nouvelle Structure d'Administration

## 🎯 Organisation en 2 Sections Distinctes

### 1. **Dashboard Association** (`/t/[slug]/dashboard`)
Gestion des activités et du contenu de l'association.

#### Onglets disponibles :
- **Vue d'ensemble** : Statistiques et actions rapides
- **Campagnes** : Gestion des collectes de fonds
- **Dons** : Suivi des donations et export CSV
- **Zmanim** : Horaires halakhiques automatiques
- **Prières** : Organisation des offices
- **Événements** : Gestion des événements communautaires

#### Statistiques en temps réel :
- Total collecté
- Dons mensuels
- Campagnes actives
- Nombre de membres
- Événements à venir

### 2. **Gestion du Site** (`/t/[slug]/site-settings`)
Configuration et personnalisation du site web.

#### Onglets disponibles :
- **Thème** : Personnalisation des couleurs et styles
- **Pages** : Création et édition de pages CMS
- **Navigation** : Configuration des menus
- **Médias** : Bibliothèque d'images et fichiers
- **Paramètres** : SEO et métadonnées

## 📁 Structure des Fichiers

```
/src/app/t/[slug]/
├── dashboard/          # Dashboard association
│   └── page.tsx       # Vue principale avec tous les modules
├── site-settings/     # Gestion du site
│   └── page.tsx       # Configuration du site
├── admin/             # Redirection automatique
│   └── page.tsx       # Redirige vers /dashboard
└── [[...path]]/       # Pages publiques du site
    └── page.tsx       # Affichage du contenu public
```

## 🔄 Navigation Entre Sections

### Depuis le Dashboard :
- Bouton "Gérer le site" → `/t/[slug]/site-settings`
- Bouton "Voir le site" → `/t/[slug]` (nouvelle fenêtre)

### Depuis la Gestion du Site :
- Bouton "Retour au dashboard" → `/t/[slug]/dashboard`
- Bouton "Voir le site" → `/t/[slug]` (nouvelle fenêtre)

## 🛠️ Composants Réutilisés

### Dashboard :
- `CampaignManager` : CRUD complet des campagnes
- `DonationTracker` : Statistiques et export des dons
- Cards personnalisées pour Zmanim et Prières

### Gestion du Site :
- `ThemeCustomizer` : Éditeur de thème visuel
- `ContentManager` : Éditeur de pages CMS
- Cards pour navigation et médias

## 🔐 Sécurité et Permissions

### Accès Dashboard :
- Rôles : `ADMIN`, `SUPER_ADMIN`, `MANAGER`, `TREASURER`
- Certaines fonctions limitées selon le rôle

### Accès Gestion du Site :
- Rôles : `ADMIN`, `SUPER_ADMIN` uniquement
- Modification complète du site

## 📊 Données et API

### Endpoints Backend Utilisés :

#### Dashboard :
- `/api/tenants/:id/campaigns` - Gestion des campagnes
- `/api/tenants/:id/donations` - Suivi des dons
- `/api/tenants/:id/donations/stats` - Statistiques
- `/api/tenants/:id/events` - Événements (à implémenter)
- `/api/tenants/:id/prayers` - Horaires de prières (à implémenter)

#### Gestion du Site :
- `/api/tenants/:id/theme` - Configuration du thème
- `/api/tenants/:id/pages` - Gestion des pages
- `/api/tenants/:id/navigation` - Menus (à implémenter)
- `/api/tenants/:id/media` - Médias (à implémenter)

## 🚀 Fonctionnalités Clés

### Dashboard Association :
1. **Statistiques en temps réel** avec cartes de métriques
2. **Activité récente** pour suivre les dernières actions
3. **Actions rapides** pour les tâches fréquentes
4. **Zmanim automatiques** basés sur la localisation
5. **Gestion des offices** avec horaires personnalisables
6. **Export CSV** des donations pour la comptabilité

### Gestion du Site :
1. **Thème en temps réel** avec preview instantané
2. **Éditeur de pages** avec support SEO
3. **Menu builder** pour la navigation
4. **Bibliothèque de médias** centralisée
5. **SEO optimisé** avec métadonnées personnalisables

## 📱 Responsive Design

Les deux sections sont entièrement responsives :
- **Mobile** : Navigation simplifiée, onglets verticaux
- **Tablette** : Grille adaptative, 2 colonnes
- **Desktop** : Vue complète avec toutes les fonctionnalités

## 🔄 Prochaines Étapes

1. **Implémenter les APIs manquantes** :
   - Événements
   - Horaires de prières
   - Navigation
   - Médias

2. **Ajouter des fonctionnalités** :
   - Calendrier hébraïque
   - Système de newsletter
   - Gestion des membres
   - Yahrzeits

3. **Intégrations** :
   - API Zmanim externes
   - Upload S3 pour les médias
   - Email transactionnel
   - Analytics

## 💡 Avantages de cette Structure

1. **Séparation claire** : Gestion vs Configuration
2. **Accès rapide** : Tout à portée de clic
3. **Scalabilité** : Facile d'ajouter de nouveaux modules
4. **UX optimisée** : Interface intuitive et moderne
5. **Performance** : Chargement par module à la demande