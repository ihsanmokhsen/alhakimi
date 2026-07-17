import { describe, expect, it } from "vitest";

import { parseBase64DataUri } from "@/lib/data-uri";

describe("parseBase64DataUri", () => {
  it("parses large image payloads without a regular-expression stack overflow", () => {
    const payload = "A".repeat(2_000_000);

    expect(parseBase64DataUri(`data:image/png;base64,${payload}`)).toEqual({
      mimeType: "image/png",
      payload
    });
  });

  it("rejects malformed data URIs", () => {
    expect(parseBase64DataUri("not-a-data-uri")).toBeNull();
    expect(parseBase64DataUri("data:image/png;base64,")).toBeNull();
  });
});
