"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export type WelcomeFormState = {
  error?: string;
  success?: string;
};

export async function updateWelcomeAction(
  _prev: WelcomeFormState,
  formData: FormData
): Promise<WelcomeFormState> {
  await requireAdmin();

  const uploaded = formData.get("welcomeFile");

  if (!(uploaded instanceof File) || uploaded.size === 0) {
    return { error: "Please select an image or GIF to upload." };
  }

  if (!uploaded.type.startsWith("image/")) {
    return { error: "File must be an image (PNG, JPG, GIF, WebP)." };
  }

  if (uploaded.size > MAX_FILE_SIZE) {
    return { error: "File terlalu besar. Maksimal 8 MB." };
  }

  const base64 = Buffer.from(await uploaded.arrayBuffer()).toString("base64");

  await prisma.siteSetting.upsert({
    where: { id: "hero" },
    create: {
      id: "hero",
      welcomeImageData: `data:${uploaded.type};base64,${base64}`
    },
    update: {
      welcomeImageData: `data:${uploaded.type};base64,${base64}`
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidateTag("welcome-image");
  return { success: "Welcome image updated!" };
}

export async function removeWelcomeAction(): Promise<WelcomeFormState> {
  await requireAdmin();

  await prisma.siteSetting.update({
    where: { id: "hero" },
    data: { welcomeImageData: null }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidateTag("welcome-image");
  return { success: "Welcome image removed." };
}
