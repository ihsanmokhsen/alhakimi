-- CreateTable
CREATE TABLE "EssayImage" (
    "id" TEXT NOT NULL,
    "essayId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "image" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EssayImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EssayImage_essayId_token_key" ON "EssayImage"("essayId", "token");

-- CreateIndex
CREATE INDEX "EssayImage_essayId_idx" ON "EssayImage"("essayId");

-- AddForeignKey
ALTER TABLE "EssayImage" ADD CONSTRAINT "EssayImage_essayId_fkey" FOREIGN KEY ("essayId") REFERENCES "Essay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
