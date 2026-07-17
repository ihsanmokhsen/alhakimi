"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_HERO_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export type HeroFormState = {
  error?: string;
  success?: string;
};

export async function updateHeroAction(
  _prev: HeroFormState,
  formData: FormData
): Promise<HeroFormState> {
  await requireAdmin();

  const heroTitle = String(formData.get("heroTitle") ?? "").trim() || null;
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "").trim() || null;

  const uploaded = formData.get("heroFile");
  let imageData: { backgroundImageData: string } | null = null;

  if (uploaded instanceof File && uploaded.size > 0) {
    if (!uploaded.type.startsWith("image/")) {
      return { error: "File must be an image (PNG, JPG, GIF, WebP, etc.)." };
    }

    if (uploaded.size > MAX_HERO_FILE_SIZE) {
      return { error: "File terlalu besar. Maksimal 8 MB." };
    }

    const base64 = Buffer.from(await uploaded.arrayBuffer()).toString("base64");
    imageData = { backgroundImageData: `data:${uploaded.type};base64,${base64}` };
  }

  await prisma.siteSetting.upsert({
    where: { id: "hero" },
    create: { id: "hero", heroTitle, heroSubtitle, ...(imageData ?? {}) },
    update: { heroTitle, heroSubtitle, ...(imageData ?? {}) }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidateTag("hero-image");
  return { success: "Hero updated!" };
}

export async function removeHeroAction(): Promise<HeroFormState> {
  await requireAdmin();

  await prisma.siteSetting.update({
    where: { id: "hero" },
    data: { backgroundImageData: null }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidateTag("hero-image");
  return { success: "Hero image removed. Falling back to default." };
}
