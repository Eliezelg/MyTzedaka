-- CreateEnum
CREATE TYPE "DonationSource" AS ENUM ('PLATFORM', 'CUSTOM_SITE', 'API', 'IMPORT');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "source" "DonationSource" NOT NULL DEFAULT 'PLATFORM',
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "donor_profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "totalDonations" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "favoriteAssociations" JSONB NOT NULL DEFAULT '[]',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "communicationPrefs" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastDonationAt" TIMESTAMP(3),

    CONSTRAINT "donor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_donor_access" (
    "id" TEXT NOT NULL,
    "donorProfileId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalDonations" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastDonationAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_donor_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "association_listings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "hasSite" BOOLEAN NOT NULL DEFAULT false,
    "siteUrl" TEXT,
    "totalCampaigns" INTEGER NOT NULL DEFAULT 0,
    "activeCampaigns" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "association_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donor_profiles_email_key" ON "donor_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "donor_profiles_cognitoId_key" ON "donor_profiles"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_donor_access_donorProfileId_tenantId_key" ON "tenant_donor_access"("donorProfileId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "association_listings_tenantId_key" ON "association_listings"("tenantId");

-- CreateIndex
CREATE INDEX "donations_userId_idx" ON "donations"("userId");

-- CreateIndex
CREATE INDEX "donations_tenantId_source_idx" ON "donations"("tenantId", "source");

-- AddForeignKey
ALTER TABLE "tenant_donor_access" ADD CONSTRAINT "tenant_donor_access_donorProfileId_fkey" FOREIGN KEY ("donorProfileId") REFERENCES "donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
