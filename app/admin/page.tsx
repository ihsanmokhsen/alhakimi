import Link from "next/link";

import { JournalForm } from "@/components/admin/journal-form";
import { JournalList } from "@/components/admin/journal-list";
import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";
import { ProjectList } from "@/components/admin/project-list";
import { createJournalAction } from "@/lib/actions/journals";
import { logoutAction } from "@/lib/actions/auth";
import { reorderProjectsAction } from "@/lib/actions/projects";
import { getJournals } from "@/lib/data/journals";
import { getProjects } from "@/lib/data/projects";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const [projects, journals] = await Promise.all([getProjects(), getJournals()]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader />

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
        <div className="grid gap-6 border-b border-black/10 pb-8 sm:pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:pb-12">
          <div>
            <p className="text-[12px] font-black uppercase tracking-normal text-[#2563ff]">Admin Dashboard</p>
            <h1 className="mt-3 max-w-4xl text-[clamp(2.65rem,6.6vw,5.8rem)] font-black leading-[0.88] tracking-normal text-black">
              Manage meaningful works.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] font-medium leading-7 text-black/58 sm:text-[17px]">
              Signed in as <span className="font-black text-black">{admin.username}</span>. Curate projects, publish
              stories, and keep the makna.im front experience sharp.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="grid w-full grid-cols-2 gap-3 lg:max-w-sm">
              <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_14px_42px_rgba(18,22,34,0.07)]">
                <p className="text-[11px] font-black uppercase text-black/34">Works</p>
                <p className="mt-2 text-[30px] font-black leading-none text-black">{projects.length}</p>
              </div>
              <div className="rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_14px_42px_rgba(18,22,34,0.07)]">
                <p className="text-[11px] font-black uppercase text-black/34">Stories</p>
                <p className="mt-2 text-[30px] font-black leading-none text-black">{journals.length}</p>
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-3 lg:max-w-sm">
              <Link
                className="inline-flex flex-1 justify-center rounded-full bg-[#2563ff] px-4 py-2.5 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(37,99,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0f4ff2]"
                href="/admin/new"
              >
                Add project
              </Link>
              <form action={logoutAction} className="flex-1">
                <button
                  className="w-full rounded-full bg-black px-4 py-2.5 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#2563ff]"
                  type="submit"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-10 pt-8 sm:pt-10">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[12px] font-black uppercase tracking-normal text-[#2563ff]">Works</p>
                <h2 className="mt-2 text-[36px] font-black leading-none tracking-normal text-black sm:text-[48px]">
                  Project library
                </h2>
              </div>
              <p className="max-w-md text-[14px] font-medium leading-6 text-black/52">
                Drag project rows to arrange how they appear on the front page.
              </p>
            </div>
            <Link
              className="inline-flex rounded-full bg-black px-4 py-2.5 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] sm:hidden"
              href="/admin/new"
            >
              Add project
            </Link>

            <ProjectList onReorder={reorderProjectsAction} projects={projects} />
          </section>

          <section className="space-y-4">
            <div className="grid gap-3 border-t border-black/10 pt-8 sm:pt-10 lg:grid-cols-[0.45fr_1fr]">
              <div>
                <p className="text-[12px] font-black uppercase tracking-normal text-[#2563ff]">Journal</p>
                <h2 className="mt-2 text-[36px] font-black leading-none tracking-normal text-black sm:text-[48px]">
                  Stories
                </h2>
              </div>
              <p className="max-w-2xl text-[15px] font-medium leading-7 text-black/56 sm:text-[17px]">
                Publish concise notes and visual updates with the same calm editorial rhythm as the public site.
              </p>
            </div>

            <JournalForm action={createJournalAction} />
            <JournalList journals={journals} />
          </section>
        </div>
      </section>

      <MaknaFooter />
    </main>
  );
}
