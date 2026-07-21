"use client";

import Image from "next/image";
import { startTransition, useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";

import type { EssayFormState } from "@/lib/actions/essays";
import type { EssayView } from "@/lib/data/essays";
import { createEssayImageMarker } from "@/lib/essay-content";
import { canvasToBlob, formatMakassarDateTimeInput, loadImage, renameFileToWebp } from "@/lib/utils";

type EssayFormProps = {
  action: (state: EssayFormState, formData: FormData) => Promise<EssayFormState>;
  essay?: EssayView | null;
  submitLabel?: string;
};

const initialState: EssayFormState = {};
const MAX_INLINE_IMAGES = 8;
const MAX_INLINE_IMAGES_TOTAL_SIZE = 5 * 1024 * 1024;

type PreparedInlineImage = {
  token: string;
  file?: File;
  previewUrl: string;
  alt: string;
  width: number;
  height: number;
};

function getDatetimeValue(value?: Date | string) {
  return value
    ? formatMakassarDateTimeInput(value)
    : formatMakassarDateTimeInput(new Date());
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

async function compressInlineImage(file: File) {
  const image = await loadImage(file);
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (file.type === "image/gif") return { file, width, height };

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return { file, width, height };

  const scale = Math.min(1, 1600 / width, 1800 / height);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let best: Blob | null = null;
  for (const quality of [0.86, 0.76, 0.66, 0.56, 0.46]) {
    const blob = await canvasToBlob(canvas, quality, "image/webp");
    best = blob;
    if (blob.size <= 650 * 1024) break;
  }

  return {
    file: best ? new File([best], renameFileToWebp(file.name), { type: "image/webp" }) : file,
    width: canvas.width,
    height: canvas.height
  };
}

function defaultImageAlt(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .slice(0, 120) || "Foto dalam essay";
}

function insertImageMarkers(content: string, position: number, tokens: string[]) {
  const safePosition = Math.min(position, content.length);
  const before = content.slice(0, safePosition);
  const after = content.slice(safePosition);
  const leadingSpace = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
  const trailingSpace = after && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
  const markers = tokens.map(createEssayImageMarker).join("\n\n");
  const inserted = `${leadingSpace}${markers}${trailingSpace}`;

  return {
    content: `${before}${inserted}${after}`,
    caret: before.length + inserted.length
  };
}

function getExistingInlineImages(essay?: EssayView | null): PreparedInlineImage[] {
  if (!essay) return [];

  return essay.inlineImages
    .map((image) => ({
      token: image.token,
      previewUrl: `/api/essay-image/${image.id}`,
      alt: image.alt,
      width: image.width,
      height: image.height
    }))
    .sort((a, b) => (
      essay.content.indexOf(createEssayImageMarker(a.token))
      - essay.content.indexOf(createEssayImageMarker(b.token))
    ));
}

export function EssayForm({ action, essay, submitLabel = "Terbitkan essay" }: EssayFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [content, setContent] = useState(essay?.content ?? "");
  const [inlineImages, setInlineImages] = useState<PreparedInlineImage[]>(() => getExistingInlineImages(essay));
  const [preparingImages, setPreparingImages] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef(0);
  const contentRef = useRef(content);
  const inlineImagesRef = useRef(inlineImages);

  useEffect(() => {
    inlineImagesRef.current = inlineImages;
  }, [inlineImages]);

  useEffect(() => () => {
    for (const image of inlineImagesRef.current) {
      if (image.file) URL.revokeObjectURL(image.previewUrl);
    }
  }, []);

  async function actionWithCompressedCover(formData: FormData) {
    if (preparingImages) {
      setLocalError("Tunggu sampai foto selesai diproses.");
      return;
    }

    setLocalError(undefined);
    const uploaded = formData.get("coverFile");
    if (uploaded instanceof File && uploaded.size > 0) {
      try {
        const compressed = await compressCover(uploaded);
        formData.set("coverFile", compressed, compressed.name);
      } catch {
        formData.set("coverFile", uploaded, uploaded.name);
      }
    }

    const submittedContent = String(formData.get("content") ?? "");
    const activeImages = inlineImages.filter(({ token }) => submittedContent.includes(createEssayImageMarker(token)));
    const uploadedImages = activeImages.filter((image): image is PreparedInlineImage & { file: File } => image.file instanceof File);
    const existingImages = activeImages.filter((image) => !image.file);
    formData.set("inlineImageManifest", JSON.stringify(uploadedImages.map(({ token, alt, width, height }) => ({
      token,
      alt: alt.trim(),
      width,
      height
    }))));
    formData.set("existingInlineImageManifest", JSON.stringify(existingImages.map(({ token, alt }) => ({
      token,
      alt: alt.trim()
    }))));
    for (const image of uploadedImages) {
      formData.append("inlineImageFiles", image.file, image.file.name);
    }

    startTransition(() => formAction(formData));
  }

  function openImagePicker() {
    const textarea = textareaRef.current;
    selectionRef.current = textarea?.selectionStart ?? content.length;
    imageInputRef.current?.click();
  }

  async function addInlineImages(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const remainingSlots = MAX_INLINE_IMAGES - inlineImagesRef.current.length;
    const selectedFiles = Array.from(input.files ?? []).slice(0, remainingSlots);
    input.value = "";

    if (selectedFiles.length === 0) {
      if (remainingSlots === 0) setLocalError(`Maksimal ${MAX_INLINE_IMAGES} foto sisipan dalam satu essay.`);
      return;
    }

    setPreparingImages(true);
    setLocalError(undefined);
    const prepared: PreparedInlineImage[] = [];
    let totalSize = inlineImagesRef.current.reduce((sum, image) => sum + (image.file?.size ?? 0), 0);

    try {
      for (const selectedFile of selectedFiles) {
        if (!selectedFile.type.startsWith("image/")) throw new Error("Berkas sisipan harus berupa gambar.");
        const compressed = await compressInlineImage(selectedFile);
        if (compressed.file.size > 1024 * 1024) {
          throw new Error(`Foto ${selectedFile.name} masih lebih besar dari 1MB setelah diproses.`);
        }
        totalSize += compressed.file.size;
        if (totalSize > MAX_INLINE_IMAGES_TOTAL_SIZE) {
          throw new Error("Total foto sisipan terlalu besar. Maksimal 5MB.");
        }

        prepared.push({
          token: crypto.randomUUID().replaceAll("-", ""),
          file: compressed.file,
          previewUrl: URL.createObjectURL(compressed.file),
          alt: defaultImageAlt(selectedFile.name),
          width: compressed.width,
          height: compressed.height
        });
      }

      setInlineImages((current) => [...current, ...prepared]);
      const insertion = insertImageMarkers(contentRef.current, selectionRef.current, prepared.map(({ token }) => token));
      contentRef.current = insertion.content;
      setContent(insertion.content);
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(insertion.caret, insertion.caret);
      });
    } catch (error) {
      for (const image of prepared) URL.revokeObjectURL(image.previewUrl);
      setLocalError(error instanceof Error ? error.message : "Foto gagal diproses.");
    } finally {
      setPreparingImages(false);
    }
  }

  function updateImageAlt(token: string, alt: string) {
    setInlineImages((current) => current.map((image) => image.token === token ? { ...image, alt } : image));
  }

  function removeInlineImage(token: string) {
    const image = inlineImagesRef.current.find((item) => item.token === token);
    if (image?.file) URL.revokeObjectURL(image.previewUrl);
    setInlineImages((current) => current.filter((item) => item.token !== token));
    const updatedContent = contentRef.current
      .split(createEssayImageMarker(token)).join("")
      .replace(/\n{3,}/g, "\n\n");
    contentRef.current = updatedContent;
    setContent(updatedContent);
  }

  const inputClass = "w-full border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]";

  return (
    <section className="border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <form action={actionWithCompressedCover} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Judul</span>
            <input className={inputClass} defaultValue={essay?.title ?? ""} name="title" placeholder="Judul essay" required type="text" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Tanggal terbit</span>
            <input className={inputClass} defaultValue={getDatetimeValue(essay?.publishedAt)} name="publishedAt" required type="datetime-local" />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Ringkasan</span>
          <textarea className={`${inputClass} min-h-24 leading-6`} defaultValue={essay?.excerpt ?? ""} maxLength={300} name="excerpt" placeholder="Gagasan utama dalam 1-3 kalimat" required />
        </label>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <label className="text-[12px] font-black uppercase text-[color:var(--text)]/42" htmlFor="essay-content">Tulisan lengkap</label>
            <button
              className="border border-[#ff4f0a]/25 bg-[#ff4f0a]/5 px-3 py-2 text-[11px] font-black text-[#ff4f0a] transition hover:bg-[#ff4f0a] hover:text-white disabled:opacity-50"
              disabled={preparingImages || inlineImages.length >= MAX_INLINE_IMAGES}
              onClick={openImagePicker}
              type="button"
            >
              {preparingImages ? "Memproses foto..." : "+ Sisipkan foto di posisi kursor"}
            </button>
            <input accept="image/avif,image/gif,image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={addInlineImages} ref={imageInputRef} type="file" />
          </div>
          <textarea
            className={`${inputClass} min-h-72 leading-7`}
            id="essay-content"
            name="content"
            onChange={(event) => {
              contentRef.current = event.target.value;
              setContent(event.target.value);
            }}
            placeholder="Tulis essay di sini. Pisahkan paragraf dengan baris kosong."
            ref={textareaRef}
            required
            value={content}
          />
          <p className="text-[12px] font-medium leading-5 text-[color:var(--text)]/42">
            Letakkan kursor di antara paragraf, lalu pilih foto. Jangan mengubah penanda foto yang ditambahkan otomatis.
          </p>
        </div>

        {inlineImages.length > 0 ? (
          <div className="space-y-2 border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase text-[color:var(--text)]/42">Foto dalam tulisan</p>
              <span className="text-[11px] font-bold text-[color:var(--text)]/36">{inlineImages.length}/{MAX_INLINE_IMAGES}</span>
            </div>
            {inlineImages.map((image, index) => (
              <div className="flex items-center gap-3 border border-[color:var(--border)] bg-[color:var(--surface)] p-2.5" key={image.token}>
                <Image alt="" className="h-16 w-20 shrink-0 object-cover" height={64} src={image.previewUrl} unoptimized width={80} />
                <label className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-black uppercase text-[color:var(--text)]/36">Teks alternatif foto {index + 1}</span>
                  <input
                    className="w-full border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-3 py-2 text-[12px] font-semibold outline-none focus:border-[#ff4f0a]/45"
                    maxLength={120}
                    onChange={(event) => updateImageAlt(image.token, event.target.value)}
                    value={image.alt}
                  />
                </label>
                <button className="shrink-0 px-2 py-2 text-[11px] font-black text-red-500" onClick={() => removeInlineImage(image.token)} type="button">Hapus</button>
              </div>
            ))}
          </div>
        ) : null}

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Sampul opsional</span>
          <input accept="image/*" className={`${inputClass} text-[13px] file:mr-3 file:border-0 file:bg-black file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white`} name="coverFile" type="file" />
          {essay?.hasCover ? (
            <div className="flex flex-col gap-3 border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] p-3 sm:flex-row sm:items-center">
              <Image
                alt={`Sampul ${essay.title}`}
                className="h-24 w-36 object-cover"
                height={96}
                src={`/api/essay-cover/${essay.id}?v=${new Date(essay.updatedAt).getTime()}`}
                unoptimized
                width={144}
              />
              <label className="flex items-center gap-2 text-[12px] font-bold text-[color:var(--text)]/58">
                <input className="h-4 w-4 accent-red-500" name="removeCover" type="checkbox" />
                Hapus sampul saat menyimpan
              </label>
            </div>
          ) : null}
          {essay ? <p className="text-[12px] font-medium text-[color:var(--text)]/42">Kosongkan jika sampul tidak diubah.</p> : null}
          <p className="text-[12px] font-medium text-[color:var(--text)]/42">Gambar otomatis diubah ke WebP sekitar 350KB.</p>
        </label>

        {localError || state.error ? <p className="bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">{localError ?? state.error}</p> : null}
        {state.success ? <p className="bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-600">Essay berhasil diterbitkan.</p> : null}

        <button className="bg-black px-5 py-3 text-[12px] font-black text-white transition hover:bg-[#ff4f0a] disabled:opacity-60" disabled={pending || preparingImages} type="submit">
          {pending ? "Menyimpan..." : preparingImages ? "Menyiapkan foto..." : submitLabel}
        </button>
      </form>
    </section>
  );
}
