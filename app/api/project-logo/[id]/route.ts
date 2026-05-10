import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const FALLBACK_LOGO_PATH = "/foto.png";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      logoImage: true,
      logoMimeType: true
    }
  });

  if (!project?.logoImage || !project.logoMimeType) {
    return NextResponse.redirect(new URL(FALLBACK_LOGO_PATH, request.url));
  }

  return new NextResponse(new Uint8Array(project.logoImage), {
    headers: {
      "Content-Type": project.logoMimeType,
      "Cache-Control": "public, max-age=86400"
    }
  });
}
