-- CreateEnum
CREATE TYPE "ParnassType" AS ENUM ('DAILY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ParnassStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DedicationType" AS ENUM ('IN_MEMORY', 'FOR_HEALING', 'FOR_SUCCESS', 'IN_HONOR', 'FOR_MERIT');

-- CreateTable
CREATE TABLE "parnass_sponsors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ParnassType" NOT NULL,
    "sponsorDate" TIMESTAMP(3) NOT NULL,
    "sponsorName" TEXT NOT NULL,
    "sponsorMessage" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "dedicationType" "DedicationType",
    "dedicationName" TEXT,
    "dedicationNameHebrew" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "donationId" TEXT,
    "displayPriority" INTEGER NOT NULL DEFAULT 0,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "status" "ParnassStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parnass_sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parnass_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dailyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "monthlyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "yearlyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dailyPrice" DECIMAL(10,2) NOT NULL DEFAULT 100,
    "monthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 500,
    "yearlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 1800,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "displayLocation" TEXT[] DEFAULT ARRAY['homepage', 'sidebar']::TEXT[],
    "displayFormat" TEXT NOT NULL DEFAULT 'card',
    "dailyTitle" TEXT NOT NULL DEFAULT 'Parnass HaYom - Sponsor du Jour',
    "monthlyTitle" TEXT NOT NULL DEFAULT 'Parnass HaChodesh - Sponsor du Mois',
    "yearlyTitle" TEXT NOT NULL DEFAULT 'Parnass HaShana - Sponsor de l''Année',
    "dailyTitleHebrew" TEXT NOT NULL DEFAULT 'פרנס היום',
    "monthlyTitleHebrew" TEXT NOT NULL DEFAULT 'פרנס החודש',
    "yearlyTitleHebrew" TEXT NOT NULL DEFAULT 'פרנס השנה',
    "allowMultipleSponsors" BOOLEAN NOT NULL DEFAULT false,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "notifyAdmin" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parnass_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parnass_sponsors_donationId_key" ON "parnass_sponsors"("donationId");

-- CreateIndex
CREATE INDEX "parnass_sponsors_tenantId_sponsorDate_type_idx" ON "parnass_sponsors"("tenantId", "sponsorDate", "type");

-- CreateIndex
CREATE INDEX "parnass_sponsors_tenantId_status_idx" ON "parnass_sponsors"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "parnass_sponsors_tenantId_sponsorDate_type_key" ON "parnass_sponsors"("tenantId", "sponsorDate", "type");

-- CreateIndex
CREATE UNIQUE INDEX "parnass_settings_tenantId_key" ON "parnass_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "parnass_sponsors" ADD CONSTRAINT "parnass_sponsors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parnass_sponsors" ADD CONSTRAINT "parnass_sponsors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parnass_sponsors" ADD CONSTRAINT "parnass_sponsors_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parnass_settings" ADD CONSTRAINT "parnass_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
