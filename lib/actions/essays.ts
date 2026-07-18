"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseMakassarDateTimeInput } from "@/lib/utils";

const MAX_ESSAY_COVER_SIZE = 5 * 1024 * 1024;
type PrismaBytes = Uint8Array<ArrayBuffer>;

export type EssayFormState = {
  error?: string;
  success?: boolean;
};

const essaySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter."),
  excerpt: z.string().min(10, "Ringkasan minimal 10 karakter.").max(300, "Ringkasan maksimal 300 karakter."),
  content: z.string().min(50, "Isi essay minimal 50 karakter."),
  publishedAt: z
    .string()
    .min(1, "Tanggal terbit wajib diisi.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Tanggal terbit tidak valid.")
});

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "essay";
}

async function uniqueSlug(title: string) {
  const base = toSlug(title);
  const matches = await prisma.essay.findMany({
    select: { slug: true },
    where: { slug: { startsWith: base } }
  });
  const used = new Set(matches.map(({ slug }) => slug));

  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

async function parseCover(formData: FormData) {
  const uploaded = formData.get("coverFile");

  if (!(uploaded instanceof File) || uploaded.size === 0) return null;
  if (!uploaded.type.startsWith("image/")) throw new Error("Sampul harus berupa gambar.");
  if (uploaded.size > MAX_ESSAY_COVER_SIZE) throw new Error("Sampul terlalu besar. Maksimal 5MB.");

  return {
    coverImage: new Uint8Array(await uploaded.arrayBuffer()) as PrismaBytes,
    coverMimeType: uploaded.type
  };
}

export async function createEssayAction(
  _previousState: EssayFormState,
  formData: FormData
): Promise<EssayFormState> {
  await requireAdmin();

  const parsed = essaySchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    publishedAt: String(formData.get("publishedAt") ?? "").trim()
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data essay belum lengkap." };
  }

  let coverData: { coverImage: PrismaBytes; coverMimeType: string } | null = null;
  try {
    coverData = await parseCover(formData);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload sampul gagal." };
  }

  const slug = await uniqueSlug(parsed.data.title);
  await prisma.essay.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      publishedAt: parseMakassarDateTimeInput(parsed.data.publishedAt) ?? new Date(parsed.data.publishedAt),
      ...(coverData ?? {})
    }
  });

  revalidatePath("/admin");
  revalidatePath("/essays");
  return { success: true };
}

export async function deleteEssayAction(id: string) {
  await requireAdmin();
  await prisma.essay.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/essays");
}
