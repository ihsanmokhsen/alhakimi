import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const projectCardSelect = Prisma.validator<Prisma.ProjectSelect>()({
  id: true,
  title: true,
  url: true,
  description: true,
  category: true,
  featured: true,
  position: true,
  createdAt: true,
  updatedAt: true
});

export type ProjectCard = Prisma.ProjectGetPayload<{
  select: typeof projectCardSelect;
}>;

export async function getProjects() {
  return prisma.project.findMany({
    select: projectCardSelect,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }]
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    select: projectCardSelect,
    where: { id }
  });
}
