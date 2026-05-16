import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KEEP_ALIVE_ID = "supabase-keep-alive";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0"
};

function getProvidedSecret(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return (
    request.headers.get("x-keep-alive-secret")?.trim() ||
    new URL(request.url).searchParams.get("secret")?.trim()
  );
}

function isValidSecret(provided: string | null | undefined) {
  const expected = process.env.KEEP_ALIVE_SECRET?.trim();

  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

async function writeKeepAlivePing() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "AppKeepAlive" (
      "id" TEXT PRIMARY KEY,
      "lastPingAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "pingCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const rows = await prisma.$queryRaw<Array<{ lastPingAt: Date; pingCount: number }>>`
    INSERT INTO "AppKeepAlive" ("id", "lastPingAt", "pingCount")
    VALUES (${KEEP_ALIVE_ID}, NOW(), 1)
    ON CONFLICT ("id") DO UPDATE
    SET
      "lastPingAt" = EXCLUDED."lastPingAt",
      "pingCount" = "AppKeepAlive"."pingCount" + 1
    RETURNING "lastPingAt", "pingCount"
  `;

  return rows[0];
}

async function handleKeepAlive(request: Request) {
  if (!process.env.KEEP_ALIVE_SECRET?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "KEEP_ALIVE_SECRET is not configured"
      },
      {
        status: 500,
        headers: NO_STORE_HEADERS
      }
    );
  }

  if (!isValidSecret(getProvidedSecret(request))) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized"
      },
      {
        status: 401,
        headers: NO_STORE_HEADERS
      }
    );
  }

  const ping = await writeKeepAlivePing();

  return NextResponse.json(
    {
      ok: true,
      lastPingAt: ping?.lastPingAt.toISOString(),
      pingCount: ping?.pingCount
    },
    {
      headers: NO_STORE_HEADERS
    }
  );
}

export async function GET(request: Request) {
  return handleKeepAlive(request);
}

export async function POST(request: Request) {
  return handleKeepAlive(request);
}
