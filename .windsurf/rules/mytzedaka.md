---
trigger: always_on
---

Vérification après chaque phase
À la fin de chaque phase de développement, relis le fichier correspondant à cette phase et vérifie que tout a bien été créé et implémenté conformément à ce qui était prévu.

Mise à jour du README
Une fois la vérification terminée, mets à jour le fichier README.md avec un résumé clair de ce qui a été développé dans la phase.

ensuite fait un commit sur git hub

Préparation de la phase suivante
Ensuite, crée un nouveau fichier dédié à la phase suivante, en définissant les objectifs et les tâches à réaliser.

tous les document sont et doivent etre placé dans le dossier documentation

Aucune esquive de problème
Ne contourne jamais un problème. Résous-le. Chaque obstacle doit être traité et corrigé de manière propre et durable.

Respect du schéma Prisma
Le développement doit toujours se conformer au schéma Prisma existant :

Tu peux le modifier si nécessaire.


Avant toute création de fichier ou de fonctionnalité, assure-toi d'utiliser les termes et structures déjà définis dans ce schéma.


voici le shema prisma
// Schéma Prisma Multi-Tenant avec Row Level Security

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Table principale des tenants
model Tenant {
  id          String   @id @default(uuid())
  slug        String   @unique // utilisé pour identification (subdomain)
  name        String
  domain      String?  @unique // domaine personnalisé optionnel
  status      TenantStatus @default(ACTIVE)
  
  // Configuration
  theme       Json     @default("{}")  // Configuration thème personnalisé
  settings    Json     @default("{}")  // Paramètres spécifiques
  
  // Configuration Stripe
  stripeMode  StripeMode @default(PLATFORM) // Mode de paiement Stripe
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  users       User[]
  memberships UserTenantMembership[] // Relations multi-tenant
  donations   Donation[]
  campaigns   Campaign[]
  gmahs       Gmah[]
  events      Event[]
  associationListing AssociationListing?
  stripeAccount StripeAccount? // Compte Stripe associé
  
  @@map("tenants")
}

// Énumération statut tenant
enum TenantStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

// Énumération pour le mode Stripe
enum StripeMode {
  PLATFORM    // Utilise Stripe Connect via MyTzedaka
  CUSTOM      // Utilise son propre compte Stripe
}

// Table des utilisateurs avec isolation par tenant
model User {
  id          String   @id @default(uuid())
  tenantId    String?  // Clé d'isolation (null pour utilisateurs globaux du hub)
  
  // Identifiants
  email       String
  cognitoId   String   @unique // ID utilisateur AWS Cognito
  
  // Informations personnelles
  firstName   String
  lastName    String
  phone       String?
  
  // Rôles et permissions
  role        UserRole @default(MEMBER)
  permissions Json     @default("[]")
  
  // Statut
  isActive    Boolean  @default(true)
  lastLoginAt DateTime?
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  tenant      Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  donations   Donation[]
  campaigns   Campaign[]
  gmahs       Gmah[]
  memberships UserTenantMembership[] // Relations multi-tenant
  
  @@unique([tenantId, email]) // Unique email par tenant
  @@unique([email], name: "unique_email_when_global") // Email unique pour utilisateurs globaux
  @@map("users")
}

enum UserRole {
  SUPER_ADMIN  // Accès plateforme complète
  ADMIN        // Administrateur tenant
  TREASURER    // Trésorier
  MANAGER      // Gestionnaire
  MEMBER       // Membre standard
}

// Relations multi-tenant utilisateur
model UserTenantMembership {
  id          String   @id @default(uuid())
  userId      String
  tenantId    String
  
  // Rôle spécifique dans ce tenant
  role        UserRole @default(MEMBER)
  permissions Json     @default("[]")
  
  // Statut de la membership
  isActive    Boolean  @default(true)
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@unique([userId, tenantId])
  @@map("user_tenant_memberships")
}

// Table des dons avec isolation par tenant et source tracking
model Donation {
  id          String   @id @default(uuid())
  tenantId    String   // Clé d'isolation
  userId      String
  
  // Tracking de la source du don
  source      DonationSource @default(PLATFORM) // D'où vient le don
  sourceUrl   String?        // URL spécifique si don depuis site custom
  
  // Informations du don
  amount      Decimal  @db.Decimal(10,2)
  currency    String   @default("EUR")
  type        DonationType
  status      DonationStatus @default(PENDING)
  
  // Paiement
  stripePaymentIntentId String?
  paymentMethod         String?
  
  // Récurrence (pour dons récurrents)
  isRecurring Boolean  @default(false)
  frequency   RecurrenceFrequency?
  nextPaymentDate DateTime?
  
  // Informations fiscales
  isAnonymous Boolean  @default(false)
  fiscalReceiptRequested Boolean @default(true)
  fiscalReceiptNumber String?
  
  // Affectation
  campaignId  String?
  purpose     String? // Destination du don
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id])
  campaign    Campaign? @relation(fields: [campaignId], references: [id])
  
  @@index([userId]) // Index pour requêtes cross-tenant par user
  @@index([tenantId, source]) // Index pour filtrer par source
  @@unique([stripePaymentIntentId]) // Index unique pour PaymentIntent Stripe
  @@map("donations")
}

enum DonationType {
  PUNCTUAL    // Don ponctuel
  RECURRING   // Don récurrent
  SPECIAL     // Don spécial (événement)
}

enum DonationStatus {
  PENDING     // En attente
  COMPLETED   // Complété
  FAILED      // Échoué
  REFUNDED    // Remboursé
  CANCELLED   // Annulé
}

enum RecurrenceFrequency {
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

enum DonationSource {
  PLATFORM      // Don via la plateforme centrale
  CUSTOM_SITE   // Don via site personnalisé de l'association
  API           // Don via API externe
  IMPORT        // Don importé (historique)
}

// Table des campagnes de collecte
model Campaign {
  id          String   @id @default(uuid())
  tenantId    String   // Clé d'isolation
  userId      String   // Créé par un utilisateur
  associationListingId String? // Lien vers l'association (optionnel pour campagnes privées)
  
  // Informations de la campagne
  title       String
  description String   @db.Text
  shortDescription String? // Description courte pour les cartes
  goal        Decimal  @db.Decimal(10,2)
  raised      Decimal  @default(0) @db.Decimal(10,2) // Montant collecté
  currency    String   @default("EUR")
  
  // Images et média
  coverImage  String?  // Image principale
  images      String[] @default([]) // URLs images supplémentaires
  videoUrl    String?  // URL vidéo de présentation
  
  // Statistiques
  donationsCount Int     @default(0) // Nombre de donations
  donorsCount    Int     @default(0) // Nombre de donateurs uniques
  avgDonation    Decimal @default(0) @db.Decimal(10,2) // Donation moyenne
  
  // Dates
  startDate   DateTime @default(now())
  endDate     DateTime?
  
  // Statut et visibilité
  status      CampaignStatus @default(ACTIVE)
  isActive    Boolean  @default(true)
  isUrgent    Boolean  @default(false) // Campagne urgente
  isFeatured  Boolean  @default(false) // Mise en avant
  isPublic    Boolean  @default(true)  // Visible sur la plateforme
  isVerified  Boolean  @default(false) // Vérifiée par la plateforme
  
  // Catégorisation
  category    String?  // Catégorie de la campagne
  tags        String[] @default([]) // Tags pour la recherche
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user         User      @relation(fields: [userId], references: [id])
  associationListing AssociationListing? @relation(fields: [associationListingId], references: [id])
  donations    Donation[]
  
  @@map("campaigns")
}

enum CampaignStatus {
  DRAFT       // Brouillon
  ACTIVE      // Active
  PAUSED      // Mise en pause
  COMPLETED   // Terminée avec succès
  EXPIRED     // Expirée (date de fin dépassée)
  CANCELLED   // Annulée
}

// Table Gmah (prêts sans intérêt)
model Gmah {
  id          String   @id @default(uuid())
  tenantId    String   // Clé d'isolation
  borrowerId  String
  
  // Informations du prêt
  amount      Decimal  @db.Decimal(10,2)
  currency    String   @default("EUR")
  purpose     String
  
  // Dates
  requestedAt DateTime @default(now())
  approvedAt  DateTime?
  disbursedAt DateTime?
  
  // Statut
  status      GmahStatus @default(REQUESTED)
  
  // Remboursement
  monthlyPayment Decimal? @db.Decimal(10,2)
  totalPaid   Decimal   @default(0) @db.Decimal(10,2)
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  borrower    User     @relation(fields: [borrowerId], references: [id])
  
  @@map("gmahs")
}

enum GmahStatus {
  REQUESTED   // Demandé
  APPROVED    // Approuvé
  DISBURSED   // Déboursé
  ACTIVE      // Actif (en cours de remboursement)
  COMPLETED   // Remboursé
  DEFAULTED   // En défaut
}

// Table des événements communautaires
model Event {
  id          String   @id @default(uuid())
  tenantId    String   // Clé d'isolation
  
  // Informations de l'événement
  title       String
  description String?
  type        EventType
  
  // Dates et lieu
  startDate   DateTime
  endDate     DateTime?
  location    String?
  
  // Participation
  maxParticipants Int?
  price       Decimal? @db.Decimal(10,2)
  currency    String   @default("EUR")
  
  // Statut
  status      EventStatus @default(DRAFT)
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@map("events")
}

enum EventType {
  RELIGIOUS   // Événement religieux
  CULTURAL    // Événement culturel
  EDUCATIONAL // Événement éducatif
  SOCIAL      // Événement social
  FUNDRAISING // Collecte de fonds
}

enum EventStatus {
  DRAFT       // Brouillon
  PUBLISHED   // Publié
  CANCELLED   // Annulé
  COMPLETED   // Terminé
}

// Table des profils donateurs globaux (cross-tenant)
model DonorProfile {
  id          String   @id @default(uuid())
  email       String   @unique // Email unique cross-tenant
  cognitoId   String   @unique // ID Cognito unique
  
  // Informations consolidées
  firstName   String
  lastName    String
  phone       String?
  
  // Statistiques globales
  totalDonations     Int      @default(0)
  totalAmount        Decimal  @default(0) @db.Decimal(12,2)
  favoriteAssociations Json   @default("[]") // Liste des tenant IDs favoris
  
  // Préférences
  preferredCurrency  String   @default("EUR")
  communicationPrefs Json     @default("{}")
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastDonationAt DateTime?
  
  // Relations
  tenantAccess TenantDonorAccess[]
  
  @@map("donor_profiles")
}

// Table de liaison donateur-tenant pour tracking cross-tenant
model TenantDonorAccess {
  id            String   @id @de