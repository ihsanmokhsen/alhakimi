"use client";

import { startTransition, useActionState } from "react";

import type { EssayFormState } from "@/lib/actions/essays";
import { canvasToBlob, loadImage, renameFileToWebp } from "@/lib/utils";

type EssayFormProps = {
  action: (state: EssayFormState, formData: FormData) => Promise<EssayFormState>;
};

const initialState: EssayFormState = {};

function getDefaultDatetimeValue() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function compressCover(file: File) {
  if (file.type === "image/gif") return file;

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return file;

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let best: Blob | null = null;
  for (const quality of [0.88, 0.78, 0.68, 0.58, 0.48]) {
    const blob = await canvasToBlob(canvas, quality, "image/webp");
    best = blob;
    if (blob.size <= 350 * 1024) break;
  }

  return best
    ? new File([best], renameFileToWebp(file.name), { type: "image/webp" })
    : file;
}

export function EssayForm({ action }: EssayFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  async function actionWithCompressedCover(formData: FormData) {
    const uploaded = formData.get("coverFile");
    if (uploaded instanceof File && uploaded.size > 0) {
      try {
        const compressed = await compressCover(uploaded);
        formData.set("coverFile", compressed, compressed.name);
      } catch {
        formData.set("coverFile", uploaded, uploaded.name);
      }
    }

    startTransition(() => formAction(formData));
  }

  const inputClass = "w-full border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#2563ff]/45 focus:bg-[color:var(--surface)]";

  return (
    <section className="border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <form action={actionWithCompressedCover} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Judul</span>
            <input className={inputClass} name="title" placeholder="Judul essay" required type="text" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Tanggal terbit</span>
            <input className={inputClass} defaultValue={getDefaultDatetimeValue()} name="publishedAt" required type="datetime-local" />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Ringkasan</span>
          <textarea className={`${inputClass} min-h-24 leading-6`} maxLength={300} name="excerpt" placeholder="Gagasan utama dalam 1-3 kalimat" required />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Tulisan lengkap</span>
          <textarea className={`${inputClass} min-h-72 leading-7`} name="content" placeholder="Tulis essay di sini. Pisahkan paragraf dengan baris kosong." required />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Sampul opsional</span>
          <input accept="image/*" className={`${inputClass} text-[13px] file:mr-3 file:border-0 file:bg-black file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white`} name="coverFile" type="file" />
          <p className="text-[12px] font-medium text-[color:var(--text)]/42">Gambar otomatis diubah ke WebP sekitar 350KB.</p>
        </label>

        {state.error ? <p className="bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">{state.error}</p> : null}
        {state.success ? <p className="bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-600">Essay berhasil diterbitkan.</p> : null}

        <button className="bg-black px-5 py-3 text-[12px] font-black text-white transition hover:bg-[#2563ff] disabled:opacity-60" disabled={pending} type="submit">
          {pending ? "Menerbitkan..." : "Terbitkan essay"}
        </button>
      </form>
    </section>
  );
}
