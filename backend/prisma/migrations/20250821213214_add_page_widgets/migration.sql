-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "layout" TEXT NOT NULL DEFAULT 'single-column';

-- CreateTable
CREATE TABLE "page_widgets" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "widgetType" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "column" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL DEFAULT '{}',
    "title" TEXT,
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "cssClass" TEXT,
    "backgroundColor" TEXT,
    "padding" TEXT,
    "margin" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_widgets_pageId_position_idx" ON "page_widgets"("pageId", "position");

-- AddForeignKey
ALTER TABLE "page_widgets" ADD CONSTRAINT "page_widgets_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
