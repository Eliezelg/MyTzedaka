# 🔧 Phase 5 : Modules Métier

**Statut** : 🚧 À implémenter (Juin 2025)  
**Objectif** : Développer les modules métier spécifiques au secteur caritatif juif

## 🎯 Vision Globale

La Phase 5 se concentre sur le développement des modules métier spécifiques qui distinguent MyTzedaka des plateformes génériques. Ces modules apporteront une valeur ajoutée considérable aux associations juives en offrant des fonctionnalités adaptées à leurs besoins particuliers, tout en respectant les traditions et les valeurs communautaires.

## 📋 Objectifs Principaux

### 1. Module Calendrier Hébraïque
- **Dates importantes** : Synchronisation avec le calendrier hébraïque
- **Événements religieux** : Rappels pour Rosh Hashana, Yom Kippour, etc.
- **Planification** : Organisation des campagnes selon les périodes propices
- **Notifications** : Alertes automatiques avant les fêtes importantes

### 2. Module Dons Récurrents (Tsedaka Fixe)
- **Abonnements mensuels** : Gestion des dons réguliers
- **Répartition** : Distribution automatique entre associations
- **Rappels** : Notifications avant prélèvement
- **Tableaux de bord** : Suivi de l'impact cumulé des dons récurrents

### 3. Module Fiscalité Adaptée
- **Reçus fiscaux** : Génération automatique selon pays
- **Calculs** : Estimation des déductions fiscales
- **Calendrier fiscal** : Rappels pour déclarations
- **Multi-juridictions** : Support France, Israël, USA, Canada

### 4. Module Communautés Virtuelles
- **Groupes** : Création de sous-communautés
- **Challenges** : Défis de collecte inter-communautaires
- **Tableaux de classement** : Classements des donateurs/communautés
- **Messagerie** : Communication entre membres

## 🧩 Composants à Développer

### Composants Calendrier
- `HebrewCalendar` : Affichage calendrier hébraïque/grégorien
- `EventsTimeline` : Chronologie des événements
- `CampaignScheduler` : Planificateur optimisé
- `HolidayCountdown` : Compte à rebours fêtes

### Composants Dons Récurrents
- `RecurringDonationSetup` : Configuration des dons réguliers
- `DonationDistribution` : Répartition entre associations
- `ImpactDashboard` : Tableau de bord d'impact
- `SubscriptionManager` : Gestion des abonnements

### Composants Fiscalité
- `TaxReceiptGenerator` : Génération reçus fiscaux
- `TaxCalculator` : Calculateur avantages fiscaux
- `DocumentsLibrary` : Bibliothèque documents
- `MultiCountrySelector` : Sélecteur juridiction

### Composants Communautés
- `CommunitiesExplorer` : Explorateur communautés
- `ChallengeTracker` : Suivi des défis
- `LeaderboardWidget` : Widget classement
- `CommunityMessenger` : Messagerie communautaire

## 🔄 Intégrations API

### API Calendrier
- `GET /api/hub/calendar/hebrew` : Calendrier hébraïque
- `GET /api/hub/calendar/events` : Événements à venir
- `POST /api/hub/calendar/reminders` : Configuration rappels

### API Dons Récurrents
- `POST /api/hub/donations/recurring` : Création abonnement
- `GET /api/hub/donations/recurring/:userId` : Abonnements utilisateur
- `PUT /api/hub/donations/recurring/:id` : Modification abonnement

### API Fiscalité
- `GET /api/hub/tax/receipts/:userId` : Reçus fiscaux utilisateur
- `GET /api/hub/tax/calculator/:countryCode` : Calcul avantages fiscaux
- `POST /api/hub/tax/receipts/generate` : Génération reçu fiscal

### API Communautés
- `GET /api/hub/communities` : Liste communautés
- `GET /api/hub/communities/:id` : Détail communauté
- `POST /api/hub/communities/:id/join` : Rejoindre communauté

## 📊 Modèles de Données à Ajouter

### Modèle HebrewCalendarEvent
```prisma
model HebrewCalendarEvent {
  id          String    @id @default(uuid())
  tenantId    String
  name        String
  hebrewDate  String
  gregorianDate DateTime
  description String?
  category    String
  isHoliday   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Modèle RecurringDonation
```prisma
model RecurringDonation {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String
  amount      Decimal  @db.Decimal(10,2)
  frequency   String   // monthly, quarterly, yearly
  startDate   DateTime
  nextDate    DateTime
  status      String   // active, paused, cancelled
  allocations Json     // distribution between associations
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🧪 Tests à Implémenter

- **Tests Unitaires** : Modules individuels
- **Tests d'Intégration** : Entre modules
- **Tests Culturels** : Validation par rabbins/experts
- **Tests Utilisateurs** : Sessions avec communautés

## 📈 Métriques de Réussite

- **Adoption** : 50%+ des utilisateurs utilisent au moins un module
- **Engagement** : +40% temps passé sur plateforme
- **Valeur** : +30% montant moyen des dons
- **Fidélisation** : +25% taux de rétention mensuel

## 🚀 Prochaines Étapes

1. **Sprint 1** : Module Calendrier Hébraïque
2. **Sprint 2** : Module Dons Récurrents
3. **Sprint 3** : Module Fiscalité Adaptée
4. **Sprint 4** : Module Communautés Virtuelles

## 💡 Ressources et Références

- **Calendrier Hébraïque** : API Hebcal
- **Paiements Récurrents** : Stripe Billing
- **Fiscalité** : Réglementations par pays
- **Communautés** : Modèles Discord/Slack

---

*Document créé le 27 mai 2025*  
*Dernière mise à jour : 27 mai 2025*
