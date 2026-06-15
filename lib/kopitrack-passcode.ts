import { timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";

const FALLBACK_PASSCODE = "820037";

/** Read the KopiTrack passcode from SiteSetting (DB). */
export async function getKopitrackPasscode(): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "hero" },
    select: { kopitrackPasscode: true }
  });

  return setting?.kopitrackPasscode?.trim() || FALLBACK_PASSCODE;
}

/** Constant-time comparison to prevent timing attacks. */
export function isPasscodeMatch(provided: string, expected: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
