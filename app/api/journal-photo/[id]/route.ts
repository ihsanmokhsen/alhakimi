import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const journal = await prisma.journal.findUnique({
    where: { id },
    select: {
      photoImage: true,
      photoMimeType: true
    }
  });

  if (!journal?.photoImage || !journal.photoMimeType) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(journal.photoImage), {
    headers: {
      "Content-Type": journal.photoMimeType,
      "Cache-Control": "public, max-age=86400"
    }
  });
}
