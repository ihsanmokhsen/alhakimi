import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

describe("verifySessionToken", () => {
  it("returns null for malformed tokens", async () => {
    const { verifySessionToken } = await import("@/lib/auth-core");
    await expect(verifySessionToken("bad-token")).resolves.toBeNull();
  });

  it("verifies a valid signed token", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/auth-core");
    const token = await createSessionToken("admin");

    await expect(verifySessionToken(token)).resolves.toBe("admin");
  });
});
