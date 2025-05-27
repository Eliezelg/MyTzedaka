# 🗂️ Plan de Réorganisation de la Documentation

## 📋 État Actuel - Problèmes Identifiés

### 1. **Ordre des Phases Incohérent**
- Phase 1, 2, 3 puis saut direct à Phase 6 et 7
- Manque de documentation pour Phases 4 et 5
- Confusion sur la progression réelle

### 2. **Fichiers Multiples pour une Même Phase**
- Phase 6 : 4 fichiers différents (sprint 2, 3, 4, objectifs)
- Difficile de savoir quel est l'état actuel
- Redondance d'informations

### 3. **Noms de Fichiers Non Standards**
- Mélange de conventions : MAJUSCULES.md vs minuscules.md
- Pas de préfixe numérique pour l'ordre

## 🎯 Structure Proposée

### 📁 documentation/
```
├── 00-SYNTHESE/
│   ├── README.md                      # Vue d'ensemble du projet
│   ├── AVANCEMENT-GLOBAL.md           # État actuel (ce fichier)
│   └── PLANNING-PREVISIONNEL.md       # Roadmap future
│
├── 01-ARCHITECTURE/
│   ├── ARCHITECTURE-TECHNIQUE.md      # Stack et infra
│   ├── ARCHITECTURE-HUB-CENTRAL.md    # Spécifique au hub
│   └── SCHEMAS-DB.md                  # Modèles de données
│
├── 02-CAHIER-CHARGES/
│   ├── CAHIER-CHARGES-FONCTIONNEL.md  # Vision globale
│   ├── USER-STORIES.md                # Par type d'utilisateur
│   └── SPECIFICATIONS-MODULES.md      # Détail par module
│
├── 03-PHASES-COMPLETEES/
│   ├── PHASE-01-INFRASTRUCTURE.md     # Backend multi-tenant
│   ├── PHASE-02-HUB-BACKEND.md        # API Hub Central
│   ├── PHASE-03-HUB-FRONTEND.md       # Frontend initial
│   └── PHASE-06-INTEGRATIONS.md       # Connexion API
│
├── 04-PHASE-ACTUELLE/
│   ├── PHASE-07-OBJECTIFS.md          # Vision Phase 7
│   ├── PHASE-07-SPRINT-01.md          # Sprint actuel
│   └── PHASE-07-TESTS.md              # Tests à valider
│
├── 05-PHASES-FUTURES/
│   ├── PHASE-04-CORE-FRONTEND.md      # À créer
│   ├── PHASE-05-MODULES-METIER.md     # À créer
│   ├── PHASE-08-DONATIONS.md          # À créer
│   └── PHASE-09-SITES-CUSTOM.md       # À créer
│
├── 06-GUIDES/
│   ├── INSTALLATION.md                 # Setup développeur
│   ├── DEPLOIEMENT.md                  # Guide production
│   └── TESTS.md                        # Stratégie de tests
│
└── 07-ARCHIVES/
    └── [Anciens fichiers à archiver]
```

## 🔄 Actions de Migration

### 1. **Créer la Structure de Dossiers**
```bash
mkdir -p documentation/{00-SYNTHESE,01-ARCHITECTURE,02-CAHIER-CHARGES,03-PHASES-COMPLETEES,04-PHASE-ACTUELLE,05-PHASES-FUTURES,06-GUIDES,07-ARCHIVES}
```

### 2. **Renommer et Déplacer les Fichiers Existants**
```bash
# Architecture
mv ARCHITECTURE-HUB-CENTRAL.md 01-ARCHITECTURE/
mv PLAN-DEVELOPPEMENT-ORDONNE.md 01-ARCHITECTURE/ROADMAP-INITIAL.md

# Cahier des charges
mv CAHIER-DES-CHARGES-FONCTIONNEL.md 02-CAHIER-CHARGES/

# Phases complétées
mv PHASE-1-COMPLETION.md 03-PHASES-COMPLETEES/PHASE-01-INFRASTRUCTURE.md
mv PHASE-2-HUB-CENTRAL.md 03-PHASES-COMPLETEES/PHASE-02-HUB-BACKEND.md
mv PHASE-3-FRONTEND-HUB-CENTRAL.md 03-PHASES-COMPLETEES/PHASE-03-HUB-FRONTEND.md

# Consolider Phase 6
# Fusionner phase-6-sprint-2/3/4 en un seul fichier
mv PHASE-6-OPTIMISATIONS-UX-INTEGRATIONS.md 03-PHASES-COMPLETEES/PHASE-06-INTEGRATIONS.md

# Phase actuelle
mv phase-7-objetifs.md 04-PHASE-ACTUELLE/PHASE-07-OBJECTIFS.md
mv phase-7-sprint-1-status.md 04-PHASE-ACTUELLE/PHASE-07-SPRINT-01.md

# Guides
mv INSTALLATION-SANS-DOCKER.md 06-GUIDES/INSTALLATION.md

# Archives
mv phase-6-sprint-*.md 07-ARCHIVES/
mv PHASE-HUB-INTEGRATION-TERMINEE.md 07-ARCHIVES/
mv PHASE-SUIVANTE-TESTS-INTEGRATION.md 07-ARCHIVES/
mv SPRINT-2-FRONTEND-FONCTIONNALITES-CORE.md 07-ARCHIVES/
mv TESTS-VALIDATION-REPORT.md 07-ARCHIVES/
```

### 3. **Créer les Fichiers Manquants**
- `05-PHASES-FUTURES/PHASE-04-CORE-FRONTEND.md`
- `05-PHASES-FUTURES/PHASE-05-MODULES-METIER.md`
- `05-PHASES-FUTURES/PHASE-08-DONATIONS.md`
- `05-PHASES-FUTURES/PHASE-09-SITES-CUSTOM.md`
- `06-GUIDES/DEPLOIEMENT.md`
- `06-GUIDES/TESTS.md`

### 4. **Mettre à Jour le README Principal**
- Pointer vers `00-SYNTHESE/AVANCEMENT-GLOBAL.md`
- Simplifier pour être une vraie introduction
- Ajouter liens vers documentation organisée

## ✅ Bénéfices de la Réorganisation

1. **Navigation Claire** : Numérotation logique des dossiers
2. **État Évident** : Un dossier dédié à la phase actuelle
3. **Historique Préservé** : Archives pour référence
4. **Scalabilité** : Structure prête pour phases futures
5. **Onboarding Facile** : Guides séparés pour nouveaux devs

## 🚀 Prochaines Étapes

1. **Valider** cette structure avec l'équipe
2. **Exécuter** la migration des fichiers
3. **Créer** les documents manquants
4. **Mettre à jour** tous les liens internes
5. **Commit** avec message clair sur la réorganisation

---

*Proposition créée le 27 mai 2025*
