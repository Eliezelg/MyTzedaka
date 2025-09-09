-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "templateData" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "templateId" TEXT;
