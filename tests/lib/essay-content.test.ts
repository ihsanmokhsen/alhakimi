import { describe, expect, it } from "vitest";

import {
  createEssayImageMarker,
  extractEssayImageTokens,
  splitEssayContent,
  stripEssayImageMarkers
} from "@/lib/essay-content";

describe("essay content", () => {
  it("creates and extracts inline image markers", () => {
    const marker = createEssayImageMarker("foto_12345678");

    expect(marker).toBe("[[foto:foto_12345678]]");
    expect(extractEssayImageTokens(`Awal\n\n${marker}\n\nAkhir`)).toEqual(["foto_12345678"]);
  });

  it("splits text and inline images in reading order", () => {
    expect(splitEssayContent("Paragraf awal.\n\n[[foto:abcdefgh]]\n\nParagraf akhir.")).toEqual([
      { type: "text", text: "Paragraf awal.\n\n" },
      { type: "image", token: "abcdefgh" },
      { type: "text", text: "\n\nParagraf akhir." }
    ]);
  });

  it("strips markers from plain article text", () => {
    expect(stripEssayImageMarkers("Awal\n\n[[foto:abcdefgh]]\n\nAkhir")).toBe("Awal\n\nAkhir");
  });
});
