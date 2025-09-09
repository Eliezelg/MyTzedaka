-- CreateTable
CREATE TABLE "zmanim_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "cityName" TEXT NOT NULL,
    "showSeconds" BOOLEAN NOT NULL DEFAULT false,
    "use24HourFormat" BOOLEAN NOT NULL DEFAULT true,
    "showHebrewDate" BOOLEAN NOT NULL DEFAULT true,
    "showParasha" BOOLEAN NOT NULL DEFAULT true,
    "selectedZmanim" TEXT[] DEFAULT ARRAY['hanetzHaChama', 'sofZmanShmaGRA', 'sofZmanTefilaGRA', 'chatzot', 'minchaKetana', 'shkiatHaChama', 'tzeitHakochavim']::TEXT[],
    "calculationMethod" TEXT NOT NULL DEFAULT 'GRA',
    "candleLightingOffset" INTEGER NOT NULL DEFAULT 18,
    "havdalahOffset" INTEGER NOT NULL DEFAULT 72,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zmanim_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zmanim_settings_tenantId_key" ON "zmanim_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "zmanim_settings" ADD CONSTRAINT "zmanim_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
