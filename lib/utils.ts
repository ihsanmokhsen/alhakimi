export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const MAKASSAR_TIME_ZONE = "Asia/Makassar";
const MAKASSAR_OFFSET_HOURS = 8;

export function isValidProjectUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (movedItem === undefined) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function formatJournalDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: MAKASSAR_TIME_ZONE
  }).format(date);
}

export function parseMakassarDateTimeInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const utcTimestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - MAKASSAR_OFFSET_HOURS,
    Number(minute)
  );

  return new Date(utcTimestamp);
}

export function formatMakassarDateTimeInput(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const localTimestamp = date.getTime() + MAKASSAR_OFFSET_HOURS * 60 * 60 * 1000;

  return new Date(localTimestamp).toISOString().slice(0, 16);
}

export function formatMakassarDateKey(value: Date | string = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const localTimestamp = date.getTime() + MAKASSAR_OFFSET_HOURS * 60 * 60 * 1000;

  return new Date(localTimestamp).toISOString().slice(0, 10);
}

/* ---- Image compression helpers ---- */

export function renameFileToWebp(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0) {
    return `${name}.webp`;
  }
  return `${name.slice(0, dotIndex)}.webp`;
}

export function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca gambar."));
    };
    image.src = objectUrl;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality: number, mimeType = "image/webp") {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal memproses gambar."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}
