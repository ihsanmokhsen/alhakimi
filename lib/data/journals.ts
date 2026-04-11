import { prisma } from "@/lib/prisma";

export async function getJournals() {
  return prisma.journal.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });
}

export async function getJournalById(id: string) {
  return prisma.journal.findUnique({
    where: { id }
  });
}
