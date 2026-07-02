import Link from "next/link";

import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { HeaderClock } from "@/components/portfolio/header-clock";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { RunningText } from "@/components/portfolio/running-text";
import { HeroParticles } from "@/components/portfolio/hero-particles";
import type { ProjectCard } from "@/lib/data/projects";

type HomeShellProps = {
  projects: ProjectCard[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
};

export function HomeShell({ projects, heroTitle, heroSubtitle }: HomeShellProps) {
  const title = heroTitle || "works";
  const subtitle =
    heroSubtitle ||
    "Beberapa Apps yang dibuat untuk kebutuhan kantor dan pribadi.";

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#08080a] [color-scheme:light]">
      <WorksHeader overlay />

      {/* ─────── HERO SECTION ─────── */}
      <section
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[url('/api/hero-image')] bg-cover bg-center px-4 pb-20 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-14 lg:px-8"
        id="explore"
      >
        {/* Animated background overlay gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65"
        />

        {/* Floating orbs */}
        <div aria-hidden="true" className="hero-orb hero-orb-1" />
        <div aria-hidden="true" className="hero-orb hero-orb-2" />
        <div aria-hidden="true" className="hero-orb hero-orb-3" />

        {/* Floating particles */}
        <HeroParticles />

        {/* Clock */}
        <div className="absolute left-1/2 top-28 z-20 -translate-x-1/2 sm:top-32">
          <HeaderClock light />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Title with reveal animation */}
          <h1
            className="animate-reveal-text max-w-4xl text-[clamp(2.65rem,9vw,7.1rem)] font-black leading-[0.92] tracking-tight text-white sm:leading-[0.88]"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="block">{title}</span>
          </h1>

          {/* Subtitle with staggered reveal */}
          <p
            className="animate-reveal-text mt-6 max-w-xl text-[15px] font-medium leading-7 text-white/85 sm:mt-8 sm:max-w-2xl sm:text-[18px] sm:leading-8"
            style={{ animationDelay: "0.35s" }}
          >
            {subtitle}
          </p>

          {/* CTA buttons with staggered reveal */}
          <div
            className="animate-reveal-text mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row"
            style={{ animationDelay: "0.55s" }}
          >
            <Link
              className="group relative inline-flex min-w-44 justify-center overflow-hidden rounded-full bg-[#2563ff] px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_20px_45px_rgba(37,99,255,0.26)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f4ff2] hover:shadow-[0_28px_60px_rgba(37,99,255,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              href="#works"
            >
              <span className="relative z-10">Explore Works</span>
              {/* Shine effect on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </Link>
            <Link
              className="group relative inline-flex min-w-44 justify-center overflow-hidden rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_18px_45px_rgba(0,0,0,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_24px_55px_rgba(0,0,0,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              href="/journal"
            >
              <span className="relative z-10">Baca Jurnal Harian</span>
              {/* Shine effect on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </Link>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
              Scroll
            </span>
            <svg
              className="animate-scroll-bounce h-5 w-5 text-white/60"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ─────── RUNNING TEXT ─────── */}
      <RunningText items={projects} />

      {/* ─────── WORKS SECTION ─────── */}
      <section
        className="relative scroll-mt-20 bg-white px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8"
        id="works"
      >
        {/* Section heading with subtle accent */}
        <div className="mx-auto mb-10 max-w-7xl text-center">
          <span className="inline-block rounded-full border border-[#2563ff]/15 bg-[#2563ff]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#2563ff] sm:text-[12px]">
            Portfolio
          </span>
        </div>
        <PortfolioGrid projects={projects} />
      </section>

      {/* ─────── FOOTER ─────── */}
      <WorksFooter />
    </main>
  );
}