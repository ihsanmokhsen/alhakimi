"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidProjectUrl } from "@/lib/utils";

export type ProjectFormState = {
  error?: string;
};

export type ProjectOrderState = {
  error?: string;
};

const projectSchema = z.object({
  title: z.string().min(1, "Title is required."),
  url: z.string().url("Invalid URL.").refine(isValidProjectUrl, "Please use an https:// URL."),
  description: z.string().min(1, "Description is required."),
  category: z.string().min(1, "Category is required."),
  featured: z.boolean()
});

function parseProjectInput(formData: FormData) {
  return projectSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    featured: formData.get("featured") === "on"
  });
}

export async function createProjectAction(
  _previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();

  const parsed = parseProjectInput(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Project data is incomplete." };
  }

  await prisma.project.create({
    data: {
      ...parsed.data,
      position: await prisma.project.count()
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProjectAction(
  id: string,
  _previousState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();

  const parsed = parseProjectInput(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Project changes are not valid yet." };
  }

  await prisma.project.update({
    where: { id },
    data: parsed.data
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();

  await prisma.project.delete({
    where: { id }
  });

  const projects = await prisma.project.findMany({
    orderBy: { position: "asc" },
    select: { id: true }
  });

  await prisma.$transaction(
    projects.map((project, index) =>
      prisma.project.update({
        where: { id: project.id },
        data: { position: index }
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function reorderProjectsAction(projectIds: string[]): Promise<ProjectOrderState> {
  await requireAdmin();

  if (projectIds.length === 0) {
    return { error: "No projects to reorder." };
  }

  await prisma.$transaction(
    projectIds.map((projectId, index) =>
      prisma.project.update({
        where: { id: projectId },
        data: { position: index }
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin");
  return {};
}
