import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const image = await prisma.essayImage.findUnique({
    where: { id },
    select: { image: true, mimeType: true }
  });

  if (!image) return new NextResponse("Not Found", { status: 404 });

  return new NextResponse(new Uint8Array(image.image), {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
