/*
  Warnings:

  - The `content` column on the `pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "pages" DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL DEFAULT '{}';
