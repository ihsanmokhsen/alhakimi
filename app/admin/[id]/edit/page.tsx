import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/project-form";
import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";
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
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader />

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-black/10 pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-normal text-[#2563ff]">Admin</p>
            <h1 className="mt-3 text-[clamp(2.65rem,7vw,5.2rem)] font-black leading-[0.88] tracking-normal text-black">
              Edit project
            </h1>
          </div>
          <Link
            className="inline-flex w-fit rounded-full border border-black/10 bg-white/75 px-4 py-2.5 text-[12px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-black/18 hover:bg-white"
            href="/admin"
          >
            Back
          </Link>
        </div>

        <ProjectForm action={action} project={project} submitLabel="Update project" />
      </section>

      <MaknaFooter />
    </main>
  );
}
