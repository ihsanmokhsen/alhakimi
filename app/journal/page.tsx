import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { JournalGrid } from "@/components/portfolio/journal-grid";
import { getJournals } from "@/lib/data/journals";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories — works",
  description: "Notes, reflections, product thinking, and meaningful digital experiments from works."
};

export default async function JournalPage() {
  const journals = await getJournals();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <WorksHeader active="stories" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-[12px] font-black uppercase text-[#2563ff]">Stories</p>
          <h1 className="mt-5 text-[clamp(3.8rem,10vw,8.5rem)] font-black leading-[0.86] tracking-tight text-[color:var(--text)]">
            Ideas with quiet depth.
          </h1>
          <p className="mt-8 max-w-2xl text-[17px] font-medium leading-8 text-[color:var(--text)]/58 sm:text-[20px]">
            Notes, reflections, product thinking, and meaningful digital experiments from works.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <JournalGrid journals={journals} />
      </section>

      <WorksFooter />
    </main>
  );
}
