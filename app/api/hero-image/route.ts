import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { parseBase64DataUri } from "@/lib/data-uri";
import { prisma } from "@/lib/prisma";

const FALLBACK = "/hero.jpg";

const getHeroImageData = unstable_cache(
  async () => {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "hero" },
      select: { backgroundImageData: true }
    });

    return setting?.backgroundImageData ?? null;
  },
  ["hero-image-data"],
  { revalidate: 86400, tags: ["hero-image"] }
);

export async function GET(request: Request) {
  const data = await getHeroImageData();

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
