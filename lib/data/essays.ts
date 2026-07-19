import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const essaySelect = Prisma.validator<Prisma.EssaySelect>()({
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  coverMimeType: true,
  inlineImages: {
    select: {
      id: true,
      token: true,
      alt: true,
      width: true,
      height: true
    }
  }
});

type EssayRecord = Prisma.EssayGetPayload<{
  select: typeof essaySelect;
}>;

export type EssayView = Omit<EssayRecord, "coverMimeType"> & {
  hasCover: boolean;
};

function toEssayView(essay: EssayRecord): EssayView {
  return {
    id: essay.id,
    title: essay.title,
    slug: essay.slug,
    excerpt: essay.excerpt,
    content: essay.content,
    publishedAt: essay.publishedAt,
    createdAt: essay.createdAt,
    updatedAt: essay.updatedAt,
    inlineImages: essay.inlineImages,
    hasCover: Boolean(essay.coverMimeType)
  };
}

export async function getEssays() {
  const essays = await prisma.essay.findMany({
    select: essaySelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

  return essays.map(toEssayView);
}

export async function getEssayBySlug(slug: string) {
  const essay = await prisma.essay.findUnique({
    select: essaySelect,
    where: { slug }
  });

  return essay ? toEssayView(essay) : null;
}

export async function getEssayById(id: string) {
  const essay = await prisma.essay.findUnique({
    select: essaySelect,
    where: { id }
  });

  return essay ? toEssayView(essay) : null;
}
