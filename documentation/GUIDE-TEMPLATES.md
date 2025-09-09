# Guide d'utilisation des Templates MyTzedaka

## 📋 Vue d'ensemble

Les templates MyTzedaka permettent de créer rapidement des sites web personnalisés pour les synagogues, associations et écoles juives. Chaque template est entièrement personnalisable via une interface graphique ou directement en JSON.

## 🚀 Comment activer et modifier un template

### 1. Accéder à l'interface d'administration

Il y a **3 façons** d'accéder à la gestion des templates :

#### Option A : Via la page de démonstration
```
http://localhost:3001/fr/demo-template/synagogue
```
- Page de test avec éditeur JSON en temps réel
- Permet de voir les modifications instantanément
- Idéal pour tester avant d'appliquer

#### Option B : Via le dashboard de l'association
```
http://localhost:3001/fr/associations/[slug]/dashboard
```
Puis cliquer sur "Personnaliser le site"

#### Option C : Via l'administration du site
```
http://localhost:3000/sites/[domain]/admin
```
Puis aller dans l'onglet "Templates"

### ⚠️ Authentification requise

Pour sauvegarder les modifications du template, vous devez être connecté en tant qu'administrateur :
1. Connectez-vous via `/fr/auth/login`
2. Utilisez les identifiants admin :
   - Email : `admin@test.com`
   - Mot de passe : `Test123456@`

### 2. Interface de gestion des templates

L'interface est divisée en 4 onglets :

#### 🎨 **Onglet Sélection**
- Choisissez parmi les templates disponibles :
  - **Synagogue Moderne** : Pour les lieux de culte
  - **Association Caritative** : Pour les associations d'entraide
  - **École & Éducation** : Pour les institutions éducatives

#### ✏️ **Onglet Contenu**
Modifiez facilement :
- **Section Hero** : Titre, sous-titre, image de fond
- **Horaires de prières** : Shaharit, Minha, Arvit
- **Événements** : Activez/désactivez, titre personnalisé
- **Contact** : Adresse, téléphone, email, heures d'ouverture

#### 🎨 **Onglet Style**
- Personnalisation des couleurs (bientôt disponible)
- Choix des polices
- Ajustements visuels

#### ⚙️ **Onglet Avancé**
- Éditeur JSON complet
- Modifications directes du code
- Import/Export de configurations

## 📝 Structure des données du template

### Exemple de configuration JSON complète :

```json
{
  "hero": {
    "title": "Synagogue Beth Shalom",
    "subtitle": "Un lieu de prière et de rassemblement",
    "backgroundImage": "https://images.unsplash.com/...",
    "buttons": [
      {
        "text": "Faire un don",
        "href": "/donate",
        "variant": "primary"
      },
      {
        "text": "Horaires",
        "href": "#prayers",
        "variant": "outline"
      }
    ]
  },
  
  "prayers": {
    "enabled": true,
    "title": "Horaires des Offices",
    "subtitle": "Rejoignez-nous pour les prières",
    "location": "123 Rue de la Paix, Paris",
    "times": [
      {
        "name": "Shaharit",
        "hebrewName": "שחרית",
        "icon": "☀️",
        "color": "blue",
        "times": [
          { "day": "Dimanche - Vendredi", "time": "7h00" },
          { "day": "Shabbat", "time": "9h00", "isSpecial": true }
        ]
      }
    ]
  },
  
  "events": {
    "enabled": true,
    "title": "Événements à Venir",
    "layout": "grid",
    "items": [
      {
        "id": "1",
        "title": "Cours de Torah",
        "description": "Étude hebdomadaire",
        "image": "https://...",
        "date": "Tous les mercredis",
        "time": "20h00",
        "location": "Salle d'étude",
        "category": "Étude",
        "categoryColor": "blue"
      }
    ]
  },
  
  "contact": {
    "enabled": true,
    "address": "123 Rue de la Paix",
    "phone": "01 23 45 67 89",
    "email": "contact@synagogue.fr",
    "hours": [
      { "day": "Dimanche - Jeudi", "hours": "9h00 - 18h00" },
      { "day": "Vendredi", "hours": "9h00 - 14h00" }
    ]
  }
}
```

## 🌐 Visualisation du site avec le template

### Après avoir sauvegardé un template

Une fois le template sauvegardé, il sera automatiquement utilisé sur la page d'accueil du site :

1. **Via le slug** : `http://localhost:3000/sites/[slug]`
   - Exemple : `http://localhost:3000/sites/test-asso`

2. **Via le domaine personnalisé** (si configuré) : `http://[domain].localhost:3000`
   - Exemple : `http://test-asso.localhost:3000`

Le template ne s'applique qu'à la page d'accueil. Les autres pages (donations, campagnes, etc.) utilisent leur propre mise en page.

## 🎯 Modifications courantes

### Changer le titre principal
```json
"hero": {
  "title": "Votre Nouveau Titre"
}
```

### Modifier les horaires de prières
```json
"prayers": {
  "times": [
    {
      "name": "Shaharit",
      "times": [
        { "day": "Dimanche", "time": "8h00" }
      ]
    }
  ]
}
```

### Ajouter un événement
```json
"events": {
  "items": [
    {
      "id": "nouveau",
      "title": "Nouvel événement",
      "description": "Description",
      "date": "15 Janvier 2025"
    }
  ]
}
```

### Désactiver une section
```json
"events": {
  "enabled": false
}
```

## 🖼️ Images recommandées

### Sources d'images gratuites
- **Unsplash** : https://unsplash.com (haute qualité)
- **Pexels** : https://pexels.com
- **Pixabay** : https://pixabay.com

### Dimensions recommandées
- **Hero/Banner** : 1920x1080px minimum
- **Événements** : 800x600px
- **Galerie** : 600x400px

### Format des URLs
```json
"backgroundImage": "https://images.unsplash.com/photo-ID?q=80&w=2874"
```

## 🔧 Astuces et bonnes pratiques

### 1. Sauvegarde régulière
- Cliquez sur "Sauvegarder" après chaque modification importante
- Exportez votre configuration JSON comme backup

### 2. Test en mode aperçu
- Utilisez le bouton "Prévisualiser" avant de publier
- Testez sur mobile et desktop

### 3. Optimisation des images
- Utilisez des images compressées (< 500KB)
- Privilégiez le format WebP ou JPEG optimisé
- Évitez les GIFs animés lourds

### 4. Textes et contenus
- Gardez les titres courts et impactants
- Utilisez des sous-titres descriptifs
- Mettez à jour régulièrement les événements

## 🐛 Résolution des problèmes

### Le template ne s'affiche pas
1. Vérifiez que le JSON est valide (pas d'erreur de syntaxe)
2. Assurez-vous que toutes les URLs d'images sont accessibles
3. Rafraîchissez la page avec Ctrl+F5

### Les modifications ne sont pas visibles
1. Cliquez sur "Sauvegarder"
2. Videz le cache du navigateur
3. Attendez quelques secondes pour la propagation

### Erreur lors de la sauvegarde
1. Vérifiez votre connexion internet
2. Assurez-vous d'être connecté en tant qu'admin
3. Contactez le support si le problème persiste

## 📞 Support

Pour toute question ou assistance :
- Email : support@mytzedaka.com
- Documentation : https://docs.mytzedaka.com
- GitHub : https://github.com/mytzedaka/templates

## 🎨 Templates disponibles

### 1. Synagogue Moderne
- Design épuré et professionnel
- Sections : Hero, Prières, Événements, À propos, Contact
- Couleurs : Bleu, Orange, Violet
- Idéal pour : Synagogues, Beth Hamidrash

### 2. Association Caritative
- Design chaleureux et accueillant
- Sections : Hero, Campagnes, Témoignages, Blog
- Couleurs : Vert, Rouge, Jaune
- Idéal pour : Associations d'entraide, Gmah

### 3. École & Éducation
- Design moderne et dynamique
- Sections : Hero, Programmes, Inscriptions, Actualités
- Couleurs : Bleu ciel, Vert menthe
- Idéal pour : Écoles, Talmud Torah, Kollel

## 🚀 Prochaines fonctionnalités

- [ ] Éditeur visuel drag & drop
- [ ] Bibliothèque d'images intégrée
- [ ] Templates supplémentaires
- [ ] Animations personnalisables
- [ ] Mode sombre automatique
- [ ] Export PDF du site
- [ ] Intégration calendrier hébraïque
- [ ] Widget de streaming live