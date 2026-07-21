import { type NextRequest, NextResponse } from "next/server";

import { incrementSiteVisitCount } from "@/lib/data/site-visits";
import { formatMakassarDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VISIT_COOKIE = "works_visit_day";
const BOT_USER_AGENT = /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp/i;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0"
};

export async function POST(request: NextRequest) {
  try {
    const today = formatMakassarDateKey();
    const wasCountedToday = request.cookies.get(VISIT_COOKIE)?.value === today;
    const isAdmin = Boolean(request.cookies.get("session")?.value);
    const isBot = BOT_USER_AGENT.test(request.headers.get("user-agent") ?? "");
    const shouldIncrement = !wasCountedToday && !isAdmin && !isBot;
    if (shouldIncrement) await incrementSiteVisitCount();

    const response = NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });

    if (shouldIncrement) {
      response.cookies.set(VISIT_COOKIE, today, {
        httpOnly: true,
        maxAge: 60 * 60 * 48,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }

    return response;
  } catch (error) {
    console.error("Failed to record website visit", error);
    return NextResponse.json(
      { error: "Visit counter is temporarily unavailable" },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }
}
