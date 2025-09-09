# Guide de Personnalisation des Sites Tenants

## 🎨 Accès à l'Administration

### URL de la page admin
```
http://localhost:3001/t/[votre-slug]/admin
```

Exemple : `http://localhost:3001/t/test-asso/admin`

## 📊 Dashboard d'Administration

### 1. Vue d'ensemble
- **Statistiques en temps réel** : Total collecté, Donateurs, Campagnes actives, Vues mensuelles
- **Actions rapides** : Accès direct aux fonctionnalités principales
- **Activité récente** : Historique des dernières actions

### 2. Onglet Apparence (Thème)
Pour personnaliser l'apparence de votre site :

#### Couleurs personnalisables :
- **Couleur principale** : Utilisée pour les boutons principaux, liens
- **Couleur secondaire** : Pour les éléments secondaires
- **Couleur d'accent** : Pour les alertes et notifications
- **Couleur de fond** : Arrière-plan du site
- **Couleur du texte** : Texte principal

#### Thèmes prédéfinis disponibles :
1. **Bleu Classique** - Thème professionnel bleu
2. **Vert Nature** - Tons verts apaisants
3. **Violet Élégant** - Style moderne et sophistiqué
4. **Minimaliste** - Noir et blanc épuré

#### Typographie :
- Police de caractères (Inter, Roboto, Open Sans, etc.)
- Arrondi des coins (0 pour carré, 1rem pour arrondi)

### 3. Onglet Contenu
Gestion des pages de votre site :
- Page d'accueil
- À propos
- Contact
- Création de nouvelles pages personnalisées

### 4. Onglet Paramètres
Configuration générale :
- Informations de l'organisation
- Email et téléphone de contact
- Paramètres de sécurité
- Clés API pour intégrations

## 🛠️ Personnalisation via Code

### Structure des fichiers tenant

```
frontend-hub/src/
├── app/t/[slug]/          # Routes tenant
│   └── [[...path]]/       # Pages dynamiques
├── components/tenant/      # Composants tenant
│   ├── tenant-header.tsx  # En-tête personnalisable
│   ├── tenant-footer.tsx  # Pied de page
│   ├── donation-page.tsx  # Page de don
│   ├── campaigns-page.tsx # Liste des campagnes
│   └── admin-dashboard.tsx # Dashboard admin
└── providers/
    └── tenant-provider.tsx # Contexte tenant

```

### Comment personnaliser le Header/Footer

1. **Header** (`tenant-header.tsx`) :
```typescript
// Modifier les liens de navigation
const navigationItems = [
  { label: 'Accueil', path: '' },
  { label: 'Faire un Don', path: '/donate' },
  { label: 'Campagnes', path: '/campaigns' },
  // Ajouter vos propres liens
]
```

2. **Footer** (`tenant-footer.tsx`) :
```typescript
// Ajouter les réseaux sociaux
const socialLinks = tenant.settings?.socialLinks || {}
// Facebook, Twitter, Instagram, LinkedIn
```

### Personnalisation des couleurs (CSS Variables)

Les couleurs sont définies comme variables CSS :
```css
:root {
  --primary-color: #1e40af;
  --secondary-color: #3b82f6;
  --accent-color: #f59e0b;
  --background-color: #ffffff;
  --text-color: #111827;
  --border-radius: 0.5rem;
  --font-family: 'Inter', sans-serif;
}
```

## 📱 Pages Disponibles

### Pages publiques
- `/t/[slug]` - Page d'accueil
- `/t/[slug]/donate` - Page de donation
- `/t/[slug]/campaigns` - Liste des campagnes
- `/t/[slug]/events` - Événements (à venir)
- `/t/[slug]/blog` - Blog/Actualités (à venir)

### Pages d'administration
- `/t/[slug]/admin` - Dashboard d'administration

## 🔧 Configuration Backend

### API Endpoints pour la personnalisation

1. **Récupérer les infos du tenant** :
```
GET /api/tenant/{slug}
```

2. **Mettre à jour le thème** :
```
PUT /api/tenants/{tenantId}/theme
Body: { theme: { primaryColor, secondaryColor, etc. } }
```

3. **Gérer les modules** :
```
GET /api/tenant/{tenantId}/modules
PUT /api/tenant/{tenantId}/modules
```

## 💡 Bonnes Pratiques

### 1. Cohérence visuelle
- Utilisez maximum 3-4 couleurs principales
- Gardez une police lisible
- Testez sur mobile et desktop

### 2. Performance
- Optimisez les images (< 200KB)
- Utilisez le cache navigateur
- Minimisez les requêtes API

### 3. Accessibilité
- Contraste suffisant entre texte et fond
- Tailles de police lisibles (min 14px)
- Navigation au clavier possible

## 🚀 Workflow de Personnalisation

1. **Connexion admin** : Accédez à `/t/[slug]/admin`
2. **Personnalisation visuelle** : Onglet "Apparence"
3. **Preview en temps réel** : Bouton "Aperçu"
4. **Sauvegarde** : Bouton "Sauvegarder"
5. **Test** : Vérifiez sur le site public

## 🔐 Sécurité

### Qui peut personnaliser ?
- Admins de l'association (ADMIN, SUPER_ADMIN)
- Accès protégé par authentification JWT
- Modifications isolées par tenant

### Protection des données
- Toutes les modifications sont isolées par tenant
- Pas d'accès cross-tenant
- Historique des modifications conservé

## 📝 Exemples de Personnalisation

### Exemple 1 : Association caritative
```javascript
{
  primaryColor: '#059669',    // Vert espoir
  secondaryColor: '#10b981',   // Vert clair
  accentColor: '#fbbf24',      // Jaune chaleureux
  fontFamily: 'Open Sans'      // Police accueillante
}
```

### Exemple 2 : Synagogue moderne
```javascript
{
  primaryColor: '#1e40af',    // Bleu profond
  secondaryColor: '#3b82f6',   // Bleu ciel
  accentColor: '#f59e0b',      // Or
  fontFamily: 'Playfair Display' // Police élégante
}
```

## 🆘 Support

Pour toute question sur la personnalisation :
1. Consultez la documentation : `/documentation`
2. Contactez le support technique
3. Ouvrez une issue sur GitHub

---

*Dernière mise à jour : Janvier 2025*