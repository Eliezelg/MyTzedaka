-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preferences" JSONB NOT NULL DEFAULT '{"emailNotifications":true,"donationReceipts":true,"newsletterUpdates":false,"campaignUpdates":true}';
