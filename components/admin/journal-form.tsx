"use client";

import { startTransition, useActionState } from "react";

import type { JournalFormState } from "@/lib/actions/journals";
import { GlassCard } from "@/components/ui/glass-card";

type JournalFormProps = {
  action: (state: JournalFormState, formData: FormData) => Promise<JournalFormState>;
};

const initialState: JournalFormState = {};
const JOURNAL_PHOTO_TARGET_BYTES = 200 * 1024;
const JOURNAL_PHOTO_MIME = "image/webp";

function renameFileToWebp(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0) {
    return `${name}.webp`;
  }

  return `${name.slice(0, dotIndex)}.webp`;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca gambar jurnal."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal memproses gambar jurnal."));
          return;
        }

        resolve(blob);
      },
      JOURNAL_PHOTO_MIME,
      quality
    );
  });
}

async function compressJournalPhoto(file: File) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  const sourceSide = Math.max(1, Math.min(image.naturalWidth, image.naturalHeight));
  const sourceX = Math.max(0, Math.round((image.naturalWidth - sourceSide) / 2));
  const sourceY = Math.max(0, Math.round((image.naturalHeight - sourceSide) / 2));
  let targetSide = sourceSide;
  let bestBlob: Blob | null = null;

  for (let scaleStep = 0; scaleStep < 6; scaleStep += 1) {
    const side = Math.max(1, Math.round(targetSide));
    canvas.width = side;
    canvas.height = side;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSide,
      sourceSide,
      0,
      0,
      canvas.width,
      canvas.height
    );

    for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42]) {
      const blob = await canvasToBlob(canvas, quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= JOURNAL_PHOTO_TARGET_BYTES) {
        return new File([blob], renameFileToWebp(file.name), {
          type: JOURNAL_PHOTO_MIME
        });
      }
    }

    targetSide *= 0.84;
  }

  if (!bestBlob) {
    return file;
  }

  return new File([bestBlob], renameFileToWebp(file.name), {
    type: JOURNAL_PHOTO_MIME
  });
}

function getDefaultDatetimeValue() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function JournalForm({ action }: JournalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  async function actionWithCompressedPhoto(formData: FormData) {
    const uploaded = formData.get("photoFile");

    if (uploaded instanceof File && uploaded.size > 0) {
      try {
        const compressed = await compressJournalPhoto(uploaded);
        formData.set("photoFile", compressed, compressed.name);
      } catch {
        formData.set("photoFile", uploaded, uploaded.name);
      }
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <GlassCard className="p-6 sm:p-8">
      <form action={actionWithCompressedPhoto} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Title</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Time</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              defaultValue={getDefaultDatetimeValue()}
              name="publishedAt"
              required
              type="datetime-local"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Writing</span>
          <textarea
            className="min-h-40 w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm leading-7 text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
            name="content"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Photo (new post only)</span>
          <input
            accept="image/*"
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none file:mr-3 file:rounded-xl file:border file:border-[color:var(--ui-border)] file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-[color:var(--ui-muted)]"
            name="photoFile"
            type="file"
          />
          <p className="text-[11px] text-[color:var(--ui-soft)]">Foto akan otomatis dikompres ke sekitar 200KB.</p>
        </label>

        {state.error ? <p className="text-sm text-[#ff8e75]">{state.error}</p> : null}

        <button
          className="rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ui-muted)] transition hover:border-[color:var(--ui-soft)] hover:text-accent disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : "Save journal"}
        </button>
      </form>
    </GlassCard>
  );
}
