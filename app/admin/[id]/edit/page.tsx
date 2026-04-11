import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/project-form";
import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { updateProjectAction } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth";
import { getProjectById } from "@/lib/data/projects";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  await requireAdmin();
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const action = updateProjectAction.bind(null, project.id);

  return (
    <main className="relative isolate min-h-screen px-4 py-8 sm:px-6">
      <BackgroundLayer />
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[color:var(--ui-strong)] sm:text-3xl">Edit project</h1>
          <Link className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)] hover:text-accent" href="/admin">
            Back
          </Link>
        </div>
        <ProjectForm action={action} project={project} submitLabel="Update project" />
      </div>
    </main>
  );
}
