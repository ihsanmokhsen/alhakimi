import { NextResponse } from "next/server";

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

  const match = data.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return NextResponse.json({ exists: false });
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