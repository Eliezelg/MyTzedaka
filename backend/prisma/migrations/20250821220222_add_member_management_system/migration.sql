-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DECEASED', 'MOVED');

-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('HEAD', 'SPOUSE', 'CHILD', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MembershipPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SeatReservationType" AS ENUM ('ANNUAL', 'HIGH_HOLIDAYS', 'SHABBAT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('REGISTERED', 'WAITLIST', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "zmanim_settings" ADD COLUMN     "displayChametzTimes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "displayDafYomi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "displayMolad" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "hebrewFirstName" TEXT,
    "hebrewLastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "familyId" TEXT,
    "familyRole" "FamilyRole",
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "memberNumber" TEXT NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaveDate" TIMESTAMP(3),
    "cohen" BOOLEAN NOT NULL DEFAULT false,
    "levi" BOOLEAN NOT NULL DEFAULT false,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT true,
    "smsOptIn" BOOLEAN NOT NULL DEFAULT true,
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "hebrewFamilyName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_fees" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "period" "MembershipPeriod" NOT NULL DEFAULT 'ANNUAL',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "donationId" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reminderSentAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_reservations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "type" "SeatReservationType" NOT NULL DEFAULT 'ANNUAL',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TIMESTAMP(3),
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendeeCount" INTEGER NOT NULL DEFAULT 1,
    "status" "EventRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAmount" DECIMAL(10,2),
    "dietaryRestrictions" TEXT,
    "specialNeeds" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "members_tenantId_status_idx" ON "members"("tenantId", "status");

-- CreateIndex
CREATE INDEX "members_familyId_idx" ON "members"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "members_tenantId_memberNumber_key" ON "members"("tenantId", "memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_tenantId_email_key" ON "members"("tenantId", "email");

-- CreateIndex
CREATE INDEX "families_tenantId_idx" ON "families"("tenantId");

-- CreateIndex
CREATE INDEX "membership_fees_tenantId_status_idx" ON "membership_fees"("tenantId", "status");

-- CreateIndex
CREATE INDEX "membership_fees_memberId_idx" ON "membership_fees"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_fees_tenantId_memberId_year_key" ON "membership_fees"("tenantId", "memberId", "year");

-- CreateIndex
CREATE INDEX "seat_reservations_tenantId_memberId_idx" ON "seat_reservations"("tenantId", "memberId");

-- CreateIndex
CREATE INDEX "seat_reservations_tenantId_status_idx" ON "seat_reservations"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "seat_reservations_tenantId_section_row_seatNumber_startDate_key" ON "seat_reservations"("tenantId", "section", "row", "seatNumber", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "event_registrations_tenantId_eventId_idx" ON "event_registrations"("tenantId", "eventId");

-- CreateIndex
CREATE INDEX "event_registrations_memberId_idx" ON "event_registrations"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_tenantId_memberId_eventId_key" ON "event_registrations"("tenantId", "memberId", "eventId");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reservations" ADD CONSTRAINT "seat_reservations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
