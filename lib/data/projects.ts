import { prisma } from "@/lib/prisma";

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }]
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id }
  });
}
