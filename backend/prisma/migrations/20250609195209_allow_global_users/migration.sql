/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `donations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StripeMode" AS ENUM ('PLATFORM', 'CUSTOM');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "stripeMode" "StripeMode" NOT NULL DEFAULT 'PLATFORM';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "tenantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "stripe_accounts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stripeConnectAccountId" TEXT,
    "stripeConnectStatus" TEXT,
    "stripeConnectCapabilities" JSONB NOT NULL DEFAULT '{}',
    "stripePublishableKey" TEXT,
    "stripeSecretKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "stripeAccountName" TEXT,
    "stripeAccountEmail" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "feePercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "stripe_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_accounts_tenantId_key" ON "stripe_accounts"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_stripePaymentIntentId_key" ON "donations"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "stripe_accounts" ADD CONSTRAINT "stripe_accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
