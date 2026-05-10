"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseMakassarDateTimeInput } from "@/lib/utils";

const MAX_JOURNAL_PHOTO_SIZE = 5 * 1024 * 1024;
type PrismaBytes = Uint8Array<ArrayBuffer>;

export type JournalFormState = {
  error?: string;
};

const journalSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Journal text is required."),
  publishedAt: z
    .string()
    .min(1, "Time is required.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Time is not valid.")
});

function parseJournalInput(formData: FormData) {
  return journalSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    publishedAt: String(formData.get("publishedAt") ?? "").trim()
  });
}

async function parseJournalPhoto(formData: FormData) {
  const uploaded = formData.get("photoFile");

  if (!(uploaded instanceof File) || uploaded.size === 0) {
    return null;
  }

  if (!uploaded.type.startsWith("image/")) {
    throw new Error("Foto jurnal harus berupa gambar.");
  }

  if (uploaded.size > MAX_JOURNAL_PHOTO_SIZE) {
    throw new Error("Foto jurnal terlalu besar. Maksimal 5MB.");
  }

  const rawBuffer = await uploaded.arrayBuffer();
  const bytes = new Uint8Array(rawBuffer) as PrismaBytes;
  return {
    photoImage: bytes,
    photoMimeType: uploaded.type
  };
}

export async function createJournalAction(
  _previousState: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  await requireAdmin();

  const parsed = parseJournalInput(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Journal data is incomplete." };
  }

  let photoData: { photoImage: PrismaBytes; photoMimeType: string } | null = null;
  try {
    photoData = await parseJournalPhoto(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload foto jurnal gagal." };
  }

  await prisma.journal.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      publishedAt: parseMakassarDateTimeInput(parsed.data.publishedAt) ?? new Date(parsed.data.publishedAt),
      ...(photoData ?? {})
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return {};
}

export async function deleteJournalAction(id: string) {
  await requireAdmin();

  await prisma.journal.delete({
    where: { id }
  });

  revalidatePath("/");
  revalidatePath("/admin");
}
