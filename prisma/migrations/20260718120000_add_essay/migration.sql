-- CreateTable
CREATE TABLE "Essay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coverImage" BYTEA,
    "coverMimeType" TEXT,

    CONSTRAINT "Essay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Essay_slug_key" ON "Essay"("slug");

-- CreateIndex
CREATE INDEX "Essay_publishedAt_idx" ON "Essay"("publishedAt");
