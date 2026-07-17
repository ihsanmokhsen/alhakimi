import { NextResponse } from "next/server";

import { parseBase64DataUri } from "@/lib/data-uri";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "hero" },
    select: { welcomeImageData: true }
  });
  const data = setting?.welcomeImageData;

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
