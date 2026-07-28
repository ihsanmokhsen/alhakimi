import sharp from "sharp";

const MAX_INPUT_PIXELS = 40_000_000;

export const WEBP_MIME_TYPE = "image/webp";

type ConvertImageToWebpOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export type WebpImage = {
  bytes: Uint8Array<ArrayBuffer>;
  mimeType: typeof WEBP_MIME_TYPE;
  width: number;
  height: number;
};

export async function convertImageToWebp(
  source: ArrayBuffer | Uint8Array,
  {
    maxWidth,
    maxHeight,
    quality = 80
  }: ConvertImageToWebpOptions = {}
): Promise<WebpImage> {
  try {
    let pipeline = sharp(source, {
      animated: true,
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS
    }).rotate();

    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    const { data, info } = await pipeline
      .webp({
        effort: 4,
        quality,
        smartSubsample: true
      })
      .toBuffer({ resolveWithObject: true });

    return {
      bytes: Uint8Array.from(data) as Uint8Array<ArrayBuffer>,
      mimeType: WEBP_MIME_TYPE,
      width: info.width,
      height: info.pageHeight ?? info.height
    };
  } catch {
    throw new Error("Gambar tidak dapat diproses menjadi WebP.");
  }
}
