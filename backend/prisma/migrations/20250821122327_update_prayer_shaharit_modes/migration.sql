/*
  Warnings:

  - Made the column `shaharitOffset` on table `prayer_settings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "prayer_settings" ALTER COLUMN "shaharitOffset" SET NOT NULL,
ALTER COLUMN "shaharitOffset" SET DEFAULT 30;
