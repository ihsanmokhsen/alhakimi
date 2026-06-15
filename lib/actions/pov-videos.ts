"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PovVideoFormState = {
  error?: string;
};

const povVideoSchema = z.object({
  title: z.string().min(1, "Title is required."),
  youtubeUrl: z
    .string()
    .min(1, "YouTube URL is required.")
    .refine(
      (url) =>
        /^https?:\/\/(www\.)?(youtube\.com\/(shorts|watch|embed)|youtu\.be\/)/.test(url),
      "Please enter a valid YouTube URL (e.g. https://youtube.com/shorts/...)"
    )
});

function parsePovVideoInput(formData: FormData) {
  return povVideoSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    youtubeUrl: String(formData.get("youtubeUrl") ?? "").trim()
  });
}

/** Extract YouTube video ID from various URL formats. */
function extractYoutubeId(url: string): string | null {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
}

/** Normalize any YouTube URL to a Shorts embed URL. */
function normalizeYoutubeUrl(url: string): string {
  const id = extractYoutubeId(url);
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}`;
}

export async function createPovVideoAction(
  _previousState: PovVideoFormState,
  formData: FormData
): Promise<PovVideoFormState> {
  await requireAdmin();

  const parsed = parsePovVideoInput(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Video data is incomplete." };
  }

  const maxPosition = await prisma.povVideo.aggregate({ _max: { position: true } });
  const nextPosition = (maxPosition._max.position ?? -1) + 1;

  await prisma.povVideo.create({
    data: {
      title: parsed.data.title,
      youtubeUrl: normalizeYoutubeUrl(parsed.data.youtubeUrl),
      position: nextPosition
    }
  });

  revalidatePath("/pov");
  revalidatePath("/admin");
  return {};
}

export async function deletePovVideoAction(id: string) {
  await requireAdmin();

  await prisma.povVideo.delete({ where: { id } });

  revalidatePath("/pov");
  revalidatePath("/admin");
}

export async function reorderPovVideosAction(
  _previousState: unknown,
  formData: FormData
) {
  await requireAdmin();

  const order = String(formData.get("order") ?? "").split(",").filter(Boolean);

  await Promise.all(
    order.map((id, index) =>
      prisma.povVideo.update({
        where: { id },
        data: { position: index }
      })
    )
  );

  revalidatePath("/pov");
  revalidatePath("/admin");
}
