-- CreateTable
CREATE TABLE IF NOT EXISTS "SiteVisitCounter" (
    "id" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteVisitCounter_pkey" PRIMARY KEY ("id")
);
