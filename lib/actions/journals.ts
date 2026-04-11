"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseMakassarDateTimeInput } from "@/lib/utils";

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

export async function createJournalAction(
  _previousState: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  await requireAdmin();

  const parsed = parseJournalInput(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Journal data is incomplete." };
  }

  await prisma.journal.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      publishedAt: parseMakassarDateTimeInput(parsed.data.publishedAt) ?? new Date(parsed.data.publishedAt)
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
