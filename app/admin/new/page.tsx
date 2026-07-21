import Link from "next/link";

import { ProjectForm } from "@/components/admin/project-form";
import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { createProjectAction } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <WorksHeader />

      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-[color:var(--border-solid)] pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-normal text-[#ff4f0a]">Admin</p>
            <h1 className="mt-3 text-[clamp(2.65rem,7vw,5.2rem)] font-black leading-[0.88] tracking-normal text-[color:var(--text)]">
              Add project
            </h1>
          </div>
          <Link
            className="inline-flex w-fit rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface)]/75 px-4 py-2.5 text-[12px] font-black text-[color:var(--text)] shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-black/18 hover:bg-[color:var(--surface)]"
            href="/admin"
          >
            Back
          </Link>
        </div>

        <ProjectForm action={createProjectAction} submitLabel="Save project" />
      </section>

      <WorksFooter />
    </main>
  );
}
