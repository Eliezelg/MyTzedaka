# 🧪 Phase 7 Sprint 1 - Tests Manuels

## 📋 Checklist de Validation

Date : 27 mai 2025
Testeur : [À compléter]
URL de test : http://localhost:3001/campaigns/campaign-test-1

## ✅ Tests API Backend

### Test 1 : Endpoint Campaign Detail
**Commande** :
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/hub/campaigns/campaign-test-1" -Method GET
```

**✅ VALIDÉ** : 
- ✅ API répond en 200ms
- ✅ Données complètes retournées
- ✅ Relations tenant, user, donations présentes
- ✅ Calculs automatiques : progressPercentage (25%), avgDonation (277.79€)
- ✅ Métadonnées : donationsCount (45), donorsCount (38)

**Données de test confirmées** :
- ID : campaign-test-1
- Titre : "Rénovation de la synagogue"
- Objectif : 50000€
- Collecté : 12500.75€
- Association : Kehilat Paris
- Statut : ACTIVE, FEATURED, VERIFIED

## 🎨 Tests Frontend

### Test 2 : Navigation vers la Page Détail
**URL** : http://localhost:3001/campaigns/campaign-test-1

**À vérifier** :
- [ ] Page se charge en < 2 secondes
- [ ] Pas d'erreurs dans la console
- [ ] Titre "Rénovation de la synagogue" affiché
- [ ] Breadcrumbs fonctionnels
- [ ] Responsive mobile (tester à 375px)

### Test 3 : Hero Section
**Éléments à valider** :
- [ ] Image de couverture `/assets/campaigns/synagogue-renovation.jpg`
- [ ] Titre principal visible et correct
- [ ] Description courte affichée
- [ ] Badges : "Featured", "Infrastructure", "Vérifié"
- [ ] Bouton "Soutenir" prominent

### Test 4 : Métriques et Progression
**À vérifier** :
- [ ] Barre de progression : 25% (12500€/50000€)
- [ ] Montant collecté : 12,500.75 €
- [ ] Objectif : 50,000 €
- [ ] Nombre de donateurs : 38
- [ ] Moyenne par don : 277.79 €
- [ ] Statut "Campagne active"

### Test 5 : Widget de Donation
**Fonctionnalités à tester** :
- [ ] Montants suggérés : 25€, 50€, 100€, 250€
- [ ] Sélection montant suggéré (fond bleu)
- [ ] Champ montant personnalisé fonctionnel
- [ ] Bouton "Faire un don" activé/désactivé
- [ ] Click sur "Faire un don" → console.log visible
- [ ] Icône cœur dans le bouton

### Test 6 : Onglets Contenu
**À valider** :
- [ ] Onglet "Histoire" actif par défaut
- [ ] Onglet "Progression" cliquable
- [ ] Changement de contenu au click
- [ ] Icônes MessageCircle et TrendingUp

### Test 7 : Informations Campagne
**Détails à vérifier** :
- [ ] Date de création affichée
- [ ] Date de mise à jour affichée  
- [ ] ID campagne (8 derniers caractères)
- [ ] Association "Kehilat Paris" avec lien
- [ ] Créateur "David Cohen"

### Test 8 : Partage Social
**Fonctionnalités** :
- [ ] Boutons Facebook, Twitter visibles
- [ ] Bouton copie (icône Copy)
- [ ] Click copie → URL dans clipboard
- [ ] Partage natif si supporté par navigateur

### Test 9 : Actions Utilisateur
**À tester** :
- [ ] Bouton favori (cœur) fonctionnel
- [ ] Toggle favori change l'état visuel
- [ ] Bouton partage principal fonctionnel
- [ ] Liens vers association cliquables

### Test 10 : États de Chargement
**Scénarios** :
- [ ] Skeleton loading pendant chargement
- [ ] Message d'erreur si campagne inexistante
- [ ] État "Chargement des données..." si nécessaire
- [ ] Loader2 spinner animé

## 🚀 Tests Performance

### Test 11 : Temps de Chargement
**Métriques à mesurer** :
- [ ] First Contentful Paint < 1s
- [ ] Largest Contentful Paint < 2s
- [ ] Time to Interactive < 2s
- [ ] Cumulative Layout Shift < 0.1

**Outils** : DevTools Network + Performance

### Test 12 : Cache React Query
**À vérifier** :
- [ ] Première visite : requête API
- [ ] Rechargement page : données depuis cache
- [ ] Cache valide 5 minutes (staleTime)
- [ ] Pas de refetch au focus fenêtre

### Test 13 : Responsive Design
**Breakpoints à tester** :
- [ ] Mobile 375px : widget en bas, layout vertical
- [ ] Tablet 768px : layout adaptatif
- [ ] Desktop 1920px : sidebar fixe, layout 2 colonnes
- [ ] Navigation tactile fluide

## 🐛 Tests d'Erreurs

### Test 14 : Gestion d'Erreurs
**Scénarios** :
- [ ] URL inexistante `/campaigns/inexistant` → page 404
- [ ] Serveur backend arrêté → message d'erreur
- [ ] Timeout réseau → retry automatique
- [ ] Données corrompues → fallback gracieux

### Test 15 : Validation UX
**Expérience utilisateur** :
- [ ] Navigation fluide et intuitive
- [ ] Call-to-action clair et visible
- [ ] Informations hiérarchisées
- [ ] Contenu scannable et lisible
- [ ] Cohérence visuelle avec le reste du site

## 📊 Critères de Succès

### ✅ Fonctionnel (0/15 validés)
- [ ] Toutes les données API affichées correctement
- [ ] Widget donation 100% interactif
- [ ] Partage social opérationnel
- [ ] Navigation et liens fonctionnels
- [ ] États d'erreur gérés proprement

### ✅ Performance (0/3 validés)
- [ ] Chargement initial < 2s
- [ ] Score Lighthouse > 90
- [ ] Cache React Query fonctionnel

### ✅ UX/UI (0/5 validés)
- [ ] Design moderne et cohérent
- [ ] Responsive parfait mobile/desktop
- [ ] Call-to-action prominent
- [ ] Animations fluides
- [ ] Messages d'état clairs

## 🎯 Résultat Final

**Score global** : __/23 tests validés

**Statut Phase 7 Sprint 1** :
- [ ] ✅ TERMINÉ (23/23 validés)
- [ ] 🟡 EN COURS (15-22 validés)
- [ ] ❌ À REPRENDRE (< 15 validés)

## 📝 Notes et Améliorations

### Problèmes identifiés :
- [ ] Point 1 : [À compléter]
- [ ] Point 2 : [À compléter]

### Améliorations suggérées :
- [ ] Suggestion 1 : [À compléter]
- [ ] Suggestion 2 : [À compléter]

---

**Testeur** : [Nom]
**Date de test** : [Date]
**Environnement** : Backend http://localhost:3000 + Frontend http://localhost:3001
**Navigateur** : [À spécifier]
