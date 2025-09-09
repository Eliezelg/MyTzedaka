-- CreateTable
CREATE TABLE "prayer_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "calculationMode" TEXT NOT NULL DEFAULT 'ZMANIM',
    "roundingMode" TEXT NOT NULL DEFAULT 'NONE',
    "shaharitMode" TEXT NOT NULL DEFAULT 'FIXED',
    "shaharitTime" TEXT,
    "shaharitOffset" INTEGER,
    "shaharitWeekday" TEXT,
    "shaharitShabbat" TEXT,
    "shaharitYomTov" TEXT,
    "minhaMode" TEXT NOT NULL DEFAULT 'ZMANIM',
    "minhaTime" TEXT,
    "minhaOffset" INTEGER NOT NULL DEFAULT 20,
    "minhaWeekday" TEXT,
    "minhaShabbat" TEXT,
    "minhaYomTov" TEXT,
    "arvitMode" TEXT NOT NULL DEFAULT 'ZMANIM',
    "arvitTime" TEXT,
    "arvitOffset" INTEGER NOT NULL DEFAULT 0,
    "arvitWeekday" TEXT,
    "arvitShabbat" TEXT,
    "selichotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "selichotTime" TEXT,
    "shemaMode" TEXT NOT NULL DEFAULT 'BEFORE_CHATZOT',
    "shemaOffset" INTEGER NOT NULL DEFAULT 45,
    "specialTimes" JSONB NOT NULL DEFAULT '{}',
    "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationMinutes" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_schedules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "settingsId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayType" TEXT NOT NULL,
    "shaharit" TEXT,
    "minha" TEXT,
    "arvit" TEXT,
    "selichot" TEXT,
    "musaf" TEXT,
    "neilah" TEXT,
    "notes" TEXT,
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "specialName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prayer_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prayer_settings_tenantId_key" ON "prayer_settings"("tenantId");

-- CreateIndex
CREATE INDEX "prayer_schedules_date_idx" ON "prayer_schedules"("date");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_schedules_tenantId_date_key" ON "prayer_schedules"("tenantId", "date");

-- AddForeignKey
ALTER TABLE "prayer_settings" ADD CONSTRAINT "prayer_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_schedules" ADD CONSTRAINT "prayer_schedules_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "prayer_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
