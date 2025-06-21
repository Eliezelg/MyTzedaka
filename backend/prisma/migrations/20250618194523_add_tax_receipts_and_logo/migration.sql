-- CreateEnum
CREATE TYPE "TaxReceiptStatus" AS ENUM ('DRAFT', 'GENERATED', 'SENT', 'CANCELLED');

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "logoPath" TEXT;

-- CreateTable
CREATE TABLE "tax_receipts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "donationId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donorName" TEXT NOT NULL,
    "donorAddress" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorPhone" TEXT,
    "associationName" TEXT NOT NULL,
    "associationAddress" TEXT NOT NULL,
    "associationEmail" TEXT,
    "associationPhone" TEXT,
    "associationRegistrationNumber" TEXT,
    "donationAmount" DECIMAL(10,2) NOT NULL,
    "donationCurrency" TEXT NOT NULL,
    "donationDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "legalClause" TEXT NOT NULL,
    "taxDeductionRate" DECIMAL(5,2),
    "pdfPath" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "status" "TaxReceiptStatus" NOT NULL DEFAULT 'DRAFT',
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_receipts_donationId_key" ON "tax_receipts"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_receipts_receiptNumber_key" ON "tax_receipts"("receiptNumber");

-- CreateIndex
CREATE INDEX "tax_receipts_tenantId_receiptNumber_idx" ON "tax_receipts"("tenantId", "receiptNumber");

-- CreateIndex
CREATE INDEX "tax_receipts_tenantId_issueDate_idx" ON "tax_receipts"("tenantId", "issueDate");

-- AddForeignKey
ALTER TABLE "tax_receipts" ADD CONSTRAINT "tax_receipts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_receipts" ADD CONSTRAINT "tax_receipts_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "donations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
