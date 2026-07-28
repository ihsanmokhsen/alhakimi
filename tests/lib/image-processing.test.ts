import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { convertImageToWebp, WEBP_MIME_TYPE } from "@/lib/image-processing";

describe("convertImageToWebp", () => {
  it("converts and resizes an uploaded image to WebP", async () => {
    const png = await sharp({
      create: {
        width: 40,
        height: 20,
        channels: 4,
        background: "#ff4f0a"
      }
    }).png().toBuffer();

    const converted = await convertImageToWebp(png, {
      maxWidth: 10,
      maxHeight: 10
    });
    const metadata = await sharp(converted.bytes).metadata();

    expect(converted.mimeType).toBe(WEBP_MIME_TYPE);
    expect(converted.width).toBe(10);
    expect(converted.height).toBe(5);
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(10);
    expect(metadata.height).toBe(5);
  });

  it("rejects data that is not a processable image", async () => {
    await expect(
      convertImageToWebp(new TextEncoder().encode("not-an-image"))
    ).rejects.toThrow("Gambar tidak dapat diproses menjadi WebP.");
  });
});
