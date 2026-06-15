import { NextResponse } from "next/server";

import { getKopitrackPasscode, isPasscodeMatch } from "@/lib/kopitrack-passcode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const provided = String(body?.passcode ?? "").trim();

  if (!provided) {
    return NextResponse.json(
      { ok: false, error: "Passcode wajib diisi." },
      { status: 400 }
    );
  }

  const expected = await getKopitrackPasscode();

  if (!isPasscodeMatch(provided, expected)) {
    return NextResponse.json(
      { ok: false, error: "Passcode salah." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
