import Link from "next/link";

import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { HeaderClock } from "@/components/portfolio/header-clock";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { RunningText } from "@/components/portfolio/running-text";
import type { ProjectCard } from "@/lib/data/projects";

type HomeShellProps = {
  projects: ProjectCard[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};

export function HomeShell({ projects, heroTitle, heroSubtitle }: HomeShellProps) {
  const title = heroTitle || "works";
  const subtitle = heroSubtitle || "Beberapa Apps yang dibuat untuk kebutuhan kantor dan pribadi.";
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#08080a] [color-scheme:light]">
      <WorksHeader overlay />

      <section
        className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[url('/api/hero-image')] bg-cover bg-center px-4 pb-20 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-14 lg:px-8"
        id="explore"
      >
        <div className="absolute left-1/2 top-28 z-20 -translate-x-1/2 sm:top-32">
          <HeaderClock light />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="max-w-4xl text-[clamp(2.65rem,9vw,7.1rem)] font-black leading-[0.92] tracking-normal text-white sm:leading-[0.88]">
            <span className="block">{title}</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] font-medium leading-7 text-white/85 sm:mt-8 sm:max-w-2xl sm:text-[18px] sm:leading-8">
            {subtitle}
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row">
            <Link
              className="inline-flex min-w-44 justify-center rounded-full bg-[#2563ff] px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_20px_45px_rgba(37,99,255,0.26)] transition hover:-translate-y-0.5 hover:bg-[#0f4ff2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              href="#works"
            >
              Explore Works
            </Link>
            <Link
              className="inline-flex min-w-44 justify-center rounded-full border border-black/10 bg-white/70 px-7 py-3.5 text-[14px] font-bold text-black shadow-[0_18px_45px_rgba(0,0,0,0.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-black/18 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              href="/jurnal"
            >
              Baca Jurnal Harian
            </Link>
          </div>
      </div>
      </section>

      <RunningText items={projects} />

      <section className="relative scroll-mt-20 bg-white px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8" id="works">
        <PortfolioGrid projects={projects} />
      </section>

      <WorksFooter />
    </main>
  );
}
