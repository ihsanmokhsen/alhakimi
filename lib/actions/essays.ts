"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { extractEssayImageTokens, stripEssayImageMarkers } from "@/lib/essay-content";
import { prisma } from "@/lib/prisma";
import { parseMakassarDateTimeInput } from "@/lib/utils";

const MAX_ESSAY_COVER_SIZE = 5 * 1024 * 1024;
const MAX_INLINE_IMAGE_SIZE = 1024 * 1024;
const MAX_INLINE_IMAGES_TOTAL_SIZE = 5 * 1024 * 1024;
const MAX_INLINE_IMAGES = 8;
const ALLOWED_INLINE_IMAGE_TYPES = new Set(["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"]);
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

const inlineImageManifestSchema = z.array(z.object({
  token: z.string().regex(/^[a-zA-Z0-9_-]{8,80}$/),
  alt: z.string().trim().max(120),
  width: z.number().int().min(1).max(10_000),
  height: z.number().int().min(1).max(10_000)
})).max(MAX_INLINE_IMAGES);

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

async function parseInlineImages(formData: FormData, content: string) {
  let manifestValue: unknown;
  try {
    manifestValue = JSON.parse(String(formData.get("inlineImageManifest") ?? "[]"));
  } catch {
    throw new Error("Data foto sisipan tidak valid.");
  }

  const parsedManifest = inlineImageManifestSchema.safeParse(manifestValue);
  if (!parsedManifest.success) throw new Error("Data foto sisipan tidak valid.");

  const manifest = parsedManifest.data;
  const files = formData.getAll("inlineImageFiles");
  if (files.length !== manifest.length || files.some((file) => !(file instanceof File))) {
    throw new Error("Sebagian foto sisipan tidak berhasil dikirim.");
  }

  const manifestTokens = new Set(manifest.map(({ token }) => token));
  if (manifestTokens.size !== manifest.length) throw new Error("Penanda foto sisipan terduplikasi.");

  const contentTokens = new Set(extractEssayImageTokens(content));
  if ([...contentTokens].some((token) => !manifestTokens.has(token))) {
    throw new Error("Ada penanda foto tanpa berkas. Hapus penandanya atau sisipkan ulang foto.");
  }
  if ([...manifestTokens].some((token) => !contentTokens.has(token))) {
    throw new Error("Ada foto yang belum ditempatkan di dalam tulisan.");
  }

  let totalSize = 0;
  const images = [];
  for (let index = 0; index < manifest.length; index += 1) {
    const file = files[index] as File;
    if (!ALLOWED_INLINE_IMAGE_TYPES.has(file.type)) {
      throw new Error("Foto sisipan harus berformat JPG, PNG, WebP, AVIF, atau GIF.");
    }
    if (file.size > MAX_INLINE_IMAGE_SIZE) {
      throw new Error("Satu foto sisipan terlalu besar. Maksimal 1MB per foto.");
    }

    totalSize += file.size;
    if (totalSize > MAX_INLINE_IMAGES_TOTAL_SIZE) {
      throw new Error("Total foto sisipan terlalu besar. Maksimal 5MB.");
    }

    images.push({
      ...manifest[index],
      alt: manifest[index].alt || "Foto dalam essay",
      image: new Uint8Array(await file.arrayBuffer()) as PrismaBytes,
      mimeType: file.type
    });
  }

  return images;
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

  if (stripEssayImageMarkers(parsed.data.content).length < 50) {
    return { error: "Isi essay minimal 50 karakter di luar penanda foto." };
  }

  let coverData: { coverImage: PrismaBytes; coverMimeType: string } | null = null;
  let inlineImages: Awaited<ReturnType<typeof parseInlineImages>> = [];
  try {
    coverData = await parseCover(formData);
    inlineImages = await parseInlineImages(formData, parsed.data.content);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload gambar gagal." };
  }

  const slug = await uniqueSlug(parsed.data.title);
  await prisma.essay.create({
    data: {
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      publishedAt: parseMakassarDateTimeInput(parsed.data.publishedAt) ?? new Date(parsed.data.publishedAt),
      ...(coverData ?? {}),
      inlineImages: {
        create: inlineImages
      }
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
