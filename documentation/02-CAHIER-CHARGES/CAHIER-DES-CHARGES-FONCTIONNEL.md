# 📋 Cahier des Charges Fonctionnel - Plateforme Multi-Tenant pour Communautés Juives

## 🎯 Vision Globale du Projet

### Concept Central : HUB CENTRAL + Sites Personnalisés

La plateforme fonctionne comme un **écosystème interconnecté** combinant :
- **🌐 HUB CENTRAL** : Plateforme mère recensant toutes les associations
- **🏛️ Sites Personnalisés** : Sites custom déployés pour chaque association (optionnel)
- **👤 Profil Donateur Unifié** : Un compte unique pour donner à toutes les associations
- **📊 Vision Consolidée** : Analytics multi-sources pour chaque association

## 🏗️ Architecture Fonctionnelle

### 🌟 Le HUB CENTRAL (Plateforme Mère)

**Public cible** : Donateurs cherchant à découvrir et soutenir des associations

**Fonctionnalités principales** :
- **Annuaire complet** de toutes les associations juives
- **Recherche avancée** par localisation, type, cause
- **Dons directs** via la plateforme centrale
- **Profil donateur unique** avec historique cross-associations
- **Reçus fiscaux centralisés** (CERFA automatiques)
- **Découverte** de nouvelles associations et causes

### 🏛️ Sites Personnalisés (Optionnels)

**Public cible** : Associations souhaitant une présence web dédiée

**Fonctionnalités** :
- **Site complet personnalisé** avec domaine custom
- **Thème et branding** aux couleurs de l'association
- **Modules activables** selon les besoins (dons, gmah, synagogue, etc.)
- **Gestion autonome** par les admins de l'association
- **Synchronisation automatique** avec le HUB central

## 👥 Types d'Utilisateurs et Fonctionnalités

### 🤝 Donateurs (Particuliers)

#### Compte Unique Cross-Associations
- **Inscription simplifiée** : Email + mot de passe
- **Profil complet** : Informations personnelles pour CERFA
- **Moyens de paiement** : Cartes bancaires sécurisées via Stripe
- **Préférences** : Notifications, causes préférées, associations favorites

#### Expérience de Don
- **Dons ponctuels** : Montant libre avec ou sans message
- **Dons récurrents** : Mensuel, trimestriel, annuel avec gestion automatique
- **Dons échelonnés** : Promesses de dons avec planning de paiement
- **Multi-devises** : EUR, USD, ILS avec conversion automatique
- **Dons Shabbat** : Promesses de dons validables après Shabbat

#### Dashboard Personnel
- **Vue d'ensemble** : Total donné, nombre d'associations soutenues
- **Historique complet** : Tous les dons peu importe la source (HUB ou site custom)
- **Reçus fiscaux** : Téléchargement CERFA automatiques
- **Associations favorites** : Accès rapide et suivi
- **Recommandations** : Nouvelles associations suggérées

### 🏛️ Associations

#### Gestion Multi-Sources
- **Double canal** : Dons reçus via HUB central ET site personnalisé
- **Analytics unifiés** : Vue consolidée toutes sources confondues
- **Distinction claire** : Chaque don marqué avec sa source
- **Export comptable** : Données unifiées pour la comptabilité

#### Fonctionnalités de Base
- **Profil association** : Description, photos, causes, contact
- **Page de présentation** : Personnalisable avec médias
- **QR Code dons** : Pour collectes physiques et événements
- **Messages remerciement** : Personnalisables par campagne
- **Notifications** : Alertes dons en temps réel

#### Gestion Administrative
- **Multi-administrateurs** : Plusieurs niveaux d'accès
- **Documents légaux** : Stockage sécurisé (statuts, récépissés, etc.)
- **Conformité CNIL** : Gestion des données personnelles
- **Rapports mensuels** : PDF automatiques pour le bureau

### 👑 Super-Administrateurs (Plateforme)

#### Gestion Globale
- **Création tenants** : Provisioning automatique nouvelles associations
- **Monitoring global** : Vue d'ensemble toutes associations
- **Gestion facturations** : Abonnements et commissions
- **Support technique** : Outils de diagnostic et assistance

## 🎯 Modules Fonctionnels Détaillés

### 💰 Module Dons (Tzedaka)

#### Types de Dons
- **Dons libres** : Montant au choix du donateur
- **Dons suggérés** : Montants prédéfinis par l'association
- **Dons dédiés** : Pour un projet ou une cause spécifique
- **Dons commémoratifs** : En mémoire ou en l'honneur de quelqu'un
- **Dons d'urgence** : Pour situations exceptionnelles

#### Récurrence et Planification
- **Dons récurrents** : Prélèvements automatiques programmables
- **Promesses de dons** : Engagement avec échéancier de paiement
- **Dons Shabbat** : Système de promesses validables après Shabbat
- **Rappels automatiques** : Notifications pour dons récurrents en échec

#### Gestion Fiscale
- **CERFA automatique** : Génération et envoi automatique des reçus
- **Seuils fiscaux** : Respect des plafonds de défiscalisation
- **Historique fiscal** : Vue annuelle pour déclarations
- **Export comptable** : Formats standards pour experts-comptables

### 🤝 Module Gmah (Prêts Sans Intérêt)

#### Système de Prêts
- **Demandes de prêts** : Formulaire sécurisé avec justificatifs
- **Évaluation** : Processus de validation par les administrateurs
- **Suivi des prêts** : Dashboard avec échéanciers et rappels
- **Remboursements** : Gestion automatique des échéances

#### Fonctionnalités Avancées
- **Prêts collectifs** : Plusieurs prêteurs pour un emprunteur
- **Garanties** : Système d'avals et de cautions
- **Historique crédit** : Suivi des bons et mauvais payeurs
- **Rapports** : Statistiques et performance du fonds

### 🕍 Module Synagogue

#### Gestion Cultuelle
- **Calendrier hébraïque** : Intégration complète avec zmanim
- **Horaires de prières** : Calcul automatique selon la localisation
- **Événements** : Planning des offices et célébrations
- **Montées à la Torah** : Système de réservation des honneurs

#### Mode Shabbat
- **Interface simplifiée** : Mode Shabbat sans transactions
- **Promesses de dons** : Système conforme à la halakha
- **Rappels post-Shabbat** : Validation des promesses
- **Téléphonie Shabbat** : Interface vocale pour certaines actions

#### Zmanim et Calendrier
- **Calcul précis** : Horaires selon la position géographique
- **Alertes** : Notifications avant Shabbat et fêtes
- **Calendrier intégré** : Événements synagogue + calendrier hébraïque
- **Export calendrier** : Synchronisation avec calendriers personnels

### 🎯 Module Campagnes de Collecte

#### Création de Campagnes
- **Objectifs financiers** : Montants cibles avec barres de progression
- **Durée limitée** : Campagnes avec dates de début/fin
- **Thèmes visuels** : Personnalisation graphique par campagne
- **Partage social** : Outils de promotion sur réseaux sociaux

#### Suivi et Analytics
- **Progression temps réel** : Mise à jour automatique des totaux
- **Donateurs participants** : Liste anonymisée ou publique (selon préférences)
- **Statistiques détaillées** : Conversion, panier moyen, sources de trafic
- **Historique campagnes** : Archive avec performance passée

### 🎰 Module Tombolas

#### Organisation de Tombolas
- **Création tombolas** : Interface simple avec lots et prix des tickets
- **Vente de tickets** : Système de paiement intégré
- **Tirage au sort** : Système certifié équitable et transparent
- **Gestion des lots** : Attribution automatique aux gagnants

#### Conformité Légale
- **Déclarations** : Respect de la réglementation française
- **Limites légales** : Contrôle automatique des seuils autorisés
- **Transparence** : Publication des résultats et statistiques
- **Historique** : Archive des tombolas passées

## 🌍 Spécificités Techniques

### 💳 Système de Paiement Multi-Devises

#### Intégrations
- **Stripe International** : EUR, USD, GBP et autres devises majeures
- **ZCredit Israël** : Spécifiquement pour les dons en Shekels (ILS)
- **Conversion automatique** : Taux de change en temps réel
- **Frais transparents** : Affichage clair des commissions

#### Sécurité Paiements
- **PCI DSS Compliance** : Sécurité maximale des données bancaires
- **3D Secure** : Authentification forte obligatoire
- **Détection fraude** : Algorithmes Stripe pour transactions suspectes
- **Chargeback protection** : Gestion automatique des litiges

### 📱 Interface Multi-Plateforme

#### Responsive Design
- **Mobile-first** : Interface optimisée smartphones/tablettes
- **PWA** : Application web progressive avec fonctions hors-ligne
- **Thèmes adaptatifs** : Interface claire avec mode sombre
- **Accessibilité** : Conformité WCAG 2.1 pour personnes handicapées

#### Multilingue
- **Français** : Langue principale
- **Hébreu** : Support RTL complet pour interface Hebrew
- **Anglais** : Pour communautés anglophones
- **Traduction intelligente** : Contenus générés automatiquement traduits

### 🔐 Sécurité et Conformité

#### Protection des Données
- **RGPD Compliant** : Respect strict de la réglementation européenne
- **Encryption** : Chiffrement AES-256 pour toutes les données sensibles
- **Anonymisation** : Possibilité d'anonymiser les dons pour les donateurs
- **Droit à l'oubli** : Suppression complète des données sur demande

#### Audit et Traçabilité
- **Logs complets** : Traçabilité de toutes les actions importantes
- **Backup automatique** : Sauvegardes chiffrées quotidiennes
- **Recovery** : Procédures de restauration testées
- **Monitoring** : Surveillance 24/7 de la sécurité

## 🎛️ Paramétrage par Association

### Activation Modulaire
Chaque association peut activer/désactiver :
- ✅ **Module Dons** : Toujours activé (fonctionnalité de base)
- ⚙️ **Module Gmah** : Activation optionnelle avec paramètres
- ⚙️ **Module Synagogue** : Pour synagogues et centres communautaires
- ⚙️ **Module Campagnes** : Pour associations avec collectes ciblées
- ⚙️ **Module Tombolas** : Activation avec vérification légale

### Personnalisation Visuelle
- **Thème et couleurs** : Personnalisation complète de l'interface
- **Logo et images** : Intégration des visuels de l'association
- **Domaine personnalisé** : www.mon-association.org
- **Templates emails** : Personnalisation des notifications

### Configuration Fonctionnelle
- **Montants suggérés** : Prédéfinition des montants de dons
- **Messages automatiques** : Remerciements et communications
- **Workflow validation** : Processus d'approbation des dons/prêts
- **Intégrations** : APIs avec systèmes existants (comptabilité, etc.)

## 📊 Analytics et Reporting

### Dashboard Association
- **KPIs temps réel** : Total collecté, nb donateurs, évolution
- **Graphiques interactifs** : Tendances, saisonnalité, sources
- **Segmentation donateurs** : Profils, récurrence, montants moyens
- **ROI campagnes** : Performance des différentes collectes

### Reporting Automatique
- **Rapports mensuels** : PDF automatique avec synthèse d'activité
- **Exports comptables** : Formats CSV/Excel pour experts-comptables
- **Statistiques fiscales** : Préparation déclarations annuelles
- **Benchmark** : Comparaison anonyme avec associations similaires

## 🚀 Roadmap Fonctionnelle

### Phase 1 ✅ TERMINÉE
- Infrastructure backend multi-tenant sécurisée
- Authentification AWS Cognito complète
- Tests isolation tenant validés

### Phase 2 🚧 EN COURS - Hub Central
- Portail donateur unifié cross-associations
- Annuaire global des associations
- Analytics multi-sources pour associations

### Phase 3 📅 PRÉVUE - Sites Personnalisés
- Templates personnalisables par association
- Système de thèmes et branding
- Déploiement automatisé AWS

### Phase 4 📅 PRÉVUE - Modules Métier Avancés
- Module Dons complet avec récurrence
- Module Gmah opérationnel
- Module Synagogue avec zmanim
- Modules Campagnes et Tombolas

## 🎯 Objectifs Business

### Pour les Associations
- **Augmentation collectes** : +30% grâce à la digitalisation
- **Réduction coûts** : Automatisation vs gestion manuelle
- **Fidélisation donateurs** : Expérience utilisateur optimisée
- **Transparence** : Traçabilité et reporting automatiques

### Pour les Donateurs
- **Simplicité** : Une plateforme pour toutes les associations
- **Transparence** : Suivi précis de l'utilisation des dons
- **Fiscalité** : Optimisation automatique des avantages fiscaux
- **Découverte** : Accès à un écosystème d'associations

### Pour la Plateforme
- **Économies d'échelle** : Mutualisation des coûts techniques
- **Croissance rapide** : Onboarding simplifié nouvelles associations
- **Revenus récurrents** : Modèle SaaS avec abonnements
- **Impact social** : Facilitateur de la générosité communautaire

---

Ce cahier des charges constitue la référence fonctionnelle complète pour le développement de la plateforme multi-tenant pour communautés juives.
