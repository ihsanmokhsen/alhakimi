import Link from "next/link";

import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { ProjectList } from "@/components/admin/project-list";
import { GlassCard } from "@/components/ui/glass-card";
import { logoutAction } from "@/lib/actions/auth";
import { reorderProjectsAction } from "@/lib/actions/projects";
import { getProjects } from "@/lib/data/projects";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const projects = await getProjects();

  return (
    <main className="relative isolate min-h-screen px-4 py-4 sm:px-6">
      <BackgroundLayer />
      <div className="mx-auto max-w-6xl space-y-8">
        <GlassCard className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--ui-soft)]">Admin</p>
            <h1 className="mt-3 text-2xl font-semibold text-[color:var(--ui-strong)] sm:text-3xl">{admin.username}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-muted)] transition hover:text-accent"
              href="/admin/new"
            >
              Add project
            </Link>
            <form action={logoutAction}>
              <button
                className="rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-muted)] transition hover:text-accent"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>
        </GlassCard>

        <ProjectList onReorder={reorderProjectsAction} projects={projects} />
      </div>
    </main>
  );
}
