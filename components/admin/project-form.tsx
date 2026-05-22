"use client";

import { startTransition, useActionState } from "react";

import type { ProjectFormState } from "@/lib/actions/projects";
import type { ProjectCard } from "@/lib/data/projects";

type ProjectFormProps = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  project?: ProjectCard | null;
  submitLabel: string;
};

const initialState: ProjectFormState = {};
const LOGO_TARGET_BYTES = 200 * 1024;
const LOGO_MIME_TYPE = "image/webp";

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
      reject(new Error("Gagal membaca gambar."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal memproses logo."));
          return;
        }

        resolve(blob);
      },
      LOGO_MIME_TYPE,
      quality
    );
  });
}

async function compressLogo(file: File) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  let width = image.naturalWidth;
  let height = image.naturalHeight;
  let bestBlob: Blob | null = null;

  for (let scaleStep = 0; scaleStep < 6; scaleStep += 1) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42]) {
      const blob = await canvasToBlob(canvas, quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= LOGO_TARGET_BYTES) {
        return new File([blob], renameFileToWebp(file.name), {
          type: LOGO_MIME_TYPE
        });
      }
    }

    width *= 0.84;
    height *= 0.84;
  }

  if (!bestBlob) {
    return file;
  }

  return new File([bestBlob], renameFileToWebp(file.name), {
    type: LOGO_MIME_TYPE
  });
}

export function ProjectForm({ action, project, submitLabel }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  async function actionWithCompressedLogo(formData: FormData) {
    const uploaded = formData.get("logoFile");

    if (uploaded instanceof File && uploaded.size > 0) {
      try {
        const compressed = await compressLogo(uploaded);
        formData.set("logoFile", compressed, compressed.name);
      } catch {
        formData.set("logoFile", uploaded, uploaded.name);
      }
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <section className="rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <form action={actionWithCompressedLogo} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-black/42">Title</span>
            <input
              className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
              defaultValue={project?.title ?? ""}
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-black/42">Category</span>
            <input
              className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
              defaultValue={project?.category ?? "Web App"}
              name="category"
              required
              type="text"
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-black/42">URL</span>
          <input
            className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            defaultValue={project?.url ?? ""}
            name="url"
            required
            type="url"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-black/42">App logo</span>
          <input
            accept="image/*"
            className="w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[13px] font-semibold text-black outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-3.5 file:py-1.5 file:text-[12px] file:font-black file:text-white"
            name="logoFile"
            type="file"
          />
          {project ? (
            <p className="text-[12px] font-medium text-black/42">Kosongkan jika logo tidak diubah.</p>
          ) : null}
          <p className="text-[12px] font-medium text-black/42">Logo otomatis dikompres ke sekitar 200KB saat upload.</p>
        </label>

        <label className="space-y-1.5">
          <span className="text-[12px] font-black uppercase text-black/42">Description</span>
          <textarea
            className="min-h-32 w-full rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[14px] font-semibold leading-6 text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            defaultValue={project?.description ?? ""}
            name="description"
            required
          />
        </label>

        <label className="flex items-center gap-3 rounded-[16px] border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[13px] font-bold text-black/58">
          <input
            className="h-4 w-4 accent-[#2563ff]"
            defaultChecked={project?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          Show as a featured project
        </label>

        {state.error ? <p className="rounded-2xl bg-[#2563ff]/10 px-4 py-3 text-sm font-bold text-[#2563ff]">{state.error}</p> : null}

        <button
          className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : submitLabel}
        </button>
      </form>
    </section>
  );
}
