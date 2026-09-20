import { afterEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    const key = "chat:test-allow";

    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit(key, 3, 60_000).ok).toBe(true);
    }

    const blocked = checkRateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const key = "chat:test-window";

    for (let i = 0; i < 2; i += 1) {
      expect(checkRateLimit(key, 2, 60_000).ok).toBe(true);
    }
    expect(checkRateLimit(key, 2, 60_000).ok).toBe(false);

    vi.advanceTimersByTime(61_000);

    const afterReset = checkRateLimit(key, 2, 60_000);
    expect(afterReset.ok).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it("tracks remaining requests", () => {
    const key = "chat:test-remaining";

    expect(checkRateLimit(key, 5, 60_000).remaining).toBe(4);
    expect(checkRateLimit(key, 5, 60_000).remaining).toBe(3);
  });
});

describe("getClientIp", () => {
  it("uses the first IP from x-forwarded-for", () => {
    const request = new Request("https://example.com/api/chat", {
      headers: { "x-forwarded-for": "203.0.113.7, 70.41.3.18" }
    });

    expect(getClientIp(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip then unknown", () => {
    const realIpRequest = new Request("https://example.com/api/chat", {
      headers: { "x-real-ip": "198.51.100.2" }
    });
    expect(getClientIp(realIpRequest)).toBe("198.51.100.2");

    const noIpRequest = new Request("https://example.com/api/chat");
    expect(getClientIp(noIpRequest)).toBe("unknown");
  });
});
