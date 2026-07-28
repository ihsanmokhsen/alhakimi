"use client";

import { startTransition, useActionState } from "react";

import type { JournalFormState } from "@/lib/actions/journals";
import { canvasToBlob, loadImage, renameFileToWebp } from "@/lib/utils";

type JournalFormProps = {
  action: (state: JournalFormState, formData: FormData) => Promise<JournalFormState>;
};

const initialState: JournalFormState = {};
const JOURNAL_PHOTO_TARGET_BYTES = 200 * 1024;
const JOURNAL_PHOTO_MIME = "image/webp";

async function compressJournalPhoto(file: File) {
  if (file.type === "image/gif") {
    return file;
  }

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
      const blob = await canvasToBlob(canvas, quality, JOURNAL_PHOTO_MIME);

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
    <section className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <form action={actionWithCompressedPhoto} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Title</span>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Time</span>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
              defaultValue={getDefaultDatetimeValue()}
              name="publishedAt"
              required
              type="datetime-local"
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Writing</span>
          <textarea
            className="min-h-32 w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold leading-6 text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
            name="content"
            required
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Photo (new post only)</span>
          <input
            accept="image/*"
            className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[13px] font-semibold text-[color:var(--text)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[color:var(--inverse-surface)] file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white"
            name="photoFile"
            type="file"
          />
          <p className="text-[12px] font-medium text-[color:var(--text)]/42">Foto otomatis diubah ke WebP dan dikompres ke sekitar 200KB.</p>
        </label>

        {state.error ? <p className="rounded-2xl bg-[#ff4f0a]/10 px-4 py-3 text-sm font-bold text-[#ff4f0a]">{state.error}</p> : null}

        <button
          className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#ff4f0a] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : "Save journal"}
        </button>
      </form>
    </section>
  );
}
