CREATE TABLE "CoffeeConsumption" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoffeeConsumption_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoffeeConsumption_consumedAt_idx" ON "CoffeeConsumption"("consumedAt");

CREATE INDEX "CoffeeConsumption_brand_idx" ON "CoffeeConsumption"("brand");
