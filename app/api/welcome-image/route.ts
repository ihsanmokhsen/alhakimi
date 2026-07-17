import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { parseBase64DataUri } from "@/lib/data-uri";
import { prisma } from "@/lib/prisma";

const getWelcomeImageData = unstable_cache(
  async () => {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: "hero" },
      select: { welcomeImageData: true }
    });

    return setting?.welcomeImageData ?? null;
  },
  ["welcome-image-data"],
  { revalidate: 86400, tags: ["welcome-image"] }
);

export async function GET() {
  const data = await getWelcomeImageData();

  if (!data) {
    return NextResponse.json({ exists: false });
  }

  const parsed = parseBase64DataUri(data);

  if (!parsed) {
    return NextResponse.json({ exists: false });
  }

  const buffer = Buffer.from(parsed.payload, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": parsed.mimeType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  });
}
