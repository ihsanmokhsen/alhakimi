import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const journalSelect = Prisma.validator<Prisma.JournalSelect>()({
  id: true,
  title: true,
  content: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  photoMimeType: true
});

type JournalRecord = Prisma.JournalGetPayload<{
  select: typeof journalSelect;
}>;

export type JournalView = Omit<JournalRecord, "photoMimeType"> & {
  hasPhoto: boolean;
};

function toJournalView(journal: JournalRecord): JournalView {
  return {
    id: journal.id,
    title: journal.title,
    content: journal.content,
    publishedAt: journal.publishedAt,
    createdAt: journal.createdAt,
    updatedAt: journal.updatedAt,
    hasPhoto: Boolean(journal.photoMimeType)
  };
}

export async function getJournals() {
  const journals = await prisma.journal.findMany({
    select: journalSelect,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

  return journals.map(toJournalView);
}

export async function getJournalById(id: string) {
  const journal = await prisma.journal.findUnique({
    select: journalSelect,
    where: { id }
  });

  if (!journal) {
    return null;
  }

  return toJournalView(journal);
}
