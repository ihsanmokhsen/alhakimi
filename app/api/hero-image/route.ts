import { NextResponse } from "next/server";

import { parseBase64DataUri } from "@/lib/data-uri";
import { prisma } from "@/lib/prisma";

const FALLBACK = "/hero.jpg";

export async function GET(request: Request) {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "hero" },
    select: { backgroundImageData: true }
  });
  const data = setting?.backgroundImageData;

  if (!data) {
    return NextResponse.redirect(new URL(FALLBACK, request.url));
  }

  const parsed = parseBase64DataUri(data);

  if (!parsed) {
    return NextResponse.redirect(new URL(FALLBACK, request.url));
  }

  const buffer = Buffer.from(parsed.payload, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": parsed.mimeType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  });
}
