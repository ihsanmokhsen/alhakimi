"use client";

import { startTransition, useActionState } from "react";

import type { ProjectFormState } from "@/lib/actions/projects";
import { GlassCard } from "@/components/ui/glass-card";
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
    <GlassCard className="p-6 sm:p-8">
      <form action={actionWithCompressedLogo} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Title</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              defaultValue={project?.title ?? ""}
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Category</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              defaultValue={project?.category ?? "Web App"}
              name="category"
              required
              type="text"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">URL</span>
          <input
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
            defaultValue={project?.url ?? ""}
            name="url"
            required
            type="url"
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">App logo</span>
          <input
            accept="image/*"
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none file:mr-3 file:rounded-xl file:border file:border-[color:var(--ui-border)] file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-[color:var(--ui-muted)]"
            name="logoFile"
            type="file"
          />
          {project ? (
            <p className="text-[11px] text-[color:var(--ui-soft)]">Kosongkan jika logo tidak diubah.</p>
          ) : null}
          <p className="text-[11px] text-[color:var(--ui-soft)]">Logo otomatis dikompres ke sekitar 200KB saat upload.</p>
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Description</span>
          <textarea
            className="min-h-36 w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm leading-7 text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
            defaultValue={project?.description ?? ""}
            name="description"
            required
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-muted)]">
          <input
            className="h-4 w-4 accent-[#F44A22]"
            defaultChecked={project?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          Show as a featured project
        </label>

        {state.error ? <p className="text-sm text-[#ff8e75]">{state.error}</p> : null}

        <button
          className="rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ui-muted)] transition hover:border-[color:var(--ui-soft)] hover:text-accent disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : submitLabel}
        </button>
      </form>
    </GlassCard>
  );
}
