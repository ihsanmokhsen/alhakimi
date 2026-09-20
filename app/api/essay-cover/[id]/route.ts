import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const essay = await prisma.essay.findUnique({
    where: { id },
    select: { coverImage: true, coverMimeType: true }
  });

  if (!essay?.coverImage || !essay.coverMimeType) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(essay.coverImage), {
    headers: {
      "Content-Type": essay.coverMimeType,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable"
    }
  });
}
