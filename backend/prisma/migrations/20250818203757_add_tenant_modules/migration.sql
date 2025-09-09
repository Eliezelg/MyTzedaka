-- CreateTable
CREATE TABLE "tenant_modules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "donations" BOOLEAN NOT NULL DEFAULT true,
    "campaigns" BOOLEAN NOT NULL DEFAULT true,
    "events" BOOLEAN NOT NULL DEFAULT true,
    "blog" BOOLEAN NOT NULL DEFAULT true,
    "gallery" BOOLEAN NOT NULL DEFAULT false,
    "zmanim" BOOLEAN NOT NULL DEFAULT false,
    "prayers" BOOLEAN NOT NULL DEFAULT false,
    "courses" BOOLEAN NOT NULL DEFAULT false,
    "hebrewCalendar" BOOLEAN NOT NULL DEFAULT false,
    "members" BOOLEAN NOT NULL DEFAULT false,
    "library" BOOLEAN NOT NULL DEFAULT false,
    "yahrzeits" BOOLEAN NOT NULL DEFAULT false,
    "seatingChart" BOOLEAN NOT NULL DEFAULT false,
    "mikvah" BOOLEAN NOT NULL DEFAULT false,
    "kashrut" BOOLEAN NOT NULL DEFAULT false,
    "eruv" BOOLEAN NOT NULL DEFAULT false,
    "marketplace" BOOLEAN NOT NULL DEFAULT false,
    "directory" BOOLEAN NOT NULL DEFAULT false,
    "chesed" BOOLEAN NOT NULL DEFAULT false,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "modulesConfig" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_modules_tenantId_key" ON "tenant_modules"("tenantId");

-- AddForeignKey
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
