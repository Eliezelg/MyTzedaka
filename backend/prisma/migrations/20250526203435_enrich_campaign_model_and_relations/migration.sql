-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CampaignStatus" ADD VALUE 'PAUSED';
ALTER TYPE "CampaignStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "associationListingId" TEXT,
ADD COLUMN     "avgDonation" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "donationsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "donorsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "raised" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_associationListingId_fkey" FOREIGN KEY ("associationListingId") REFERENCES "association_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
