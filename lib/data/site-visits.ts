import { prisma } from "@/lib/prisma";

const COUNTER_ID = "website";

let schemaReady: Promise<void> | undefined;

function ensureSiteVisitCounterTable() {
  if (!schemaReady) {
    schemaReady = prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SiteVisitCounter" (
        "id" TEXT NOT NULL,
        "total" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SiteVisitCounter_pkey" PRIMARY KEY ("id")
      )
    `.then(() => undefined).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }

  return schemaReady;
}

export async function getSiteVisitCount() {
  await ensureSiteVisitCounterTable();

  const rows = await prisma.$queryRaw<Array<{ total: number }>>`
    SELECT "total"
    FROM "SiteVisitCounter"
    WHERE "id" = ${COUNTER_ID}
    LIMIT 1
  `;

  return rows[0]?.total ?? 0;
}

export async function incrementSiteVisitCount() {
  await ensureSiteVisitCounterTable();

  const rows = await prisma.$queryRaw<Array<{ total: number }>>`
    INSERT INTO "SiteVisitCounter" ("id", "total", "updatedAt")
    VALUES (${COUNTER_ID}, 1, NOW())
    ON CONFLICT ("id") DO UPDATE
    SET
      "total" = "SiteVisitCounter"."total" + 1,
      "updatedAt" = NOW()
    RETURNING "total"
  `;

  return rows[0]?.total ?? 0;
}
