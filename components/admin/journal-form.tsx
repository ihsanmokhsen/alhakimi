"use client";

import { startTransition, useActionState } from "react";

import type { JournalFormState } from "@/lib/actions/journals";

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
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <form action={actionWithCompressedPhoto} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-black/42">Title</span>
            <input
              className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-black/42">Time</span>
            <input
              className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition focus:border-[#2563ff]/45 focus:bg-white"
              defaultValue={getDefaultDatetimeValue()}
              name="publishedAt"
              required
              type="datetime-local"
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-black/42">Writing</span>
          <textarea
            className="min-h-32 w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold leading-6 text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            name="content"
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-black/42">Photo (new post only)</span>
          <input
            accept="image/*"
            className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[13px] font-semibold text-black outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white"
            name="photoFile"
            type="file"
          />
          <p className="text-[12px] font-medium text-black/42">Foto akan otomatis dikompres ke sekitar 200KB.</p>
        </label>

        {state.error ? <p className="rounded-2xl bg-[#2563ff]/10 px-4 py-3 text-sm font-bold text-[#2563ff]">{state.error}</p> : null}

        <button
          className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : "Save journal"}
        </button>
      </form>
    </section>
  );
}
