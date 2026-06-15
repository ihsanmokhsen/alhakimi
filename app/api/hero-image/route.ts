import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const FALLBACK = "/hero.png";

export async function GET(request: Request) {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "hero" },
    select: { backgroundImageData: true }
  });

  const data = setting?.backgroundImageData;

  if (!data) {
    return NextResponse.redirect(new URL(FALLBACK, request.url));
  }

  /* Data is stored as a data-URI string: "data:<mime>;base64,<payload>" */
  const match = data.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return NextResponse.redirect(new URL(FALLBACK, request.url));
  }

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  });
}
