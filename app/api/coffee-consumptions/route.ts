import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KOPITRACK_PASSCODE = process.env.KOPITRACK_PASSCODE?.trim() || "820037";
const MAKASSAR_OFFSET_HOURS = 8;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0"
};

const coffeeInputSchema = z.object({
  brand: z.string().trim().min(1, "Brand wajib diisi."),
  variant: z.string().trim().min(1, "Varian wajib diisi."),
  price: z.coerce.number().int("Harga harus angka bulat.").positive("Harga harus angka positif."),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
});

function parseMakassarDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day, -MAKASSAR_OFFSET_HOURS, 0));
}

function formatMakassarDateInput(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Makassar",
    year: "numeric"
  }).format(value);
}

function getProvidedPasscode(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-kopitrack-passcode")?.trim();
}

function isValidPasscode(provided: string | null | undefined) {
  if (!provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(KOPITRACK_PASSCODE);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Passcode KopiTrack tidak valid."
    },
    {
      status: 401,
      headers: NO_STORE_HEADERS
    }
  );
}

function toCoffeeResponse(entry: {
  id: string;
  brand: string;
  variant: string;
  price: number;
  consumedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: entry.id,
    brand: entry.brand,
    variant: entry.variant,
    price: entry.price,
    date: formatMakassarDateInput(entry.consumedAt),
    consumedAt: entry.consumedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

export async function GET() {
  const entries = await prisma.coffeeConsumption.findMany({
    orderBy: [{ consumedAt: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json(
    {
      ok: true,
      entries: entries.map(toCoffeeResponse)
    },
    {
      headers: NO_STORE_HEADERS
    }
  );
}

export async function POST(request: Request) {
  if (!isValidPasscode(getProvidedPasscode(request))) {
    return unauthorizedResponse();
  }

  const parsed = coffeeInputSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Data kopi tidak valid."
      },
      {
        status: 400,
        headers: NO_STORE_HEADERS
      }
    );
  }

  const entry = await prisma.coffeeConsumption.create({
    data: {
      brand: parsed.data.brand,
      variant: parsed.data.variant,
      price: parsed.data.price,
      consumedAt: parseMakassarDateInput(parsed.data.date)
    }
  });

  return NextResponse.json(
    {
      ok: true,
      entry: toCoffeeResponse(entry)
    },
    {
      status: 201,
      headers: NO_STORE_HEADERS
    }
  );
}
