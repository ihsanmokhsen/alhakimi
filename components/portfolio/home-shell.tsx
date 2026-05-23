import Link from "next/link";

import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import type { ProjectCard } from "@/lib/data/projects";

type HomeShellProps = {
  projects: ProjectCard[];
};

export function HomeShell({ projects }: HomeShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader />

      <section
        className="relative mx-auto flex min-h-[calc(88svh-4rem)] w-full max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-10 text-center sm:min-h-[calc(94svh-5rem)] sm:px-6 sm:pb-24 sm:pt-14 lg:px-8"
        id="explore"
      >
        <p className="mb-5 text-[11px] font-bold uppercase text-black/42 sm:mb-7 sm:text-[12px]">
          Creative technology and modern storytelling
        </p>
        <h1 className="max-w-4xl text-[clamp(2.65rem,9vw,7.1rem)] font-black leading-[0.92] tracking-normal text-black sm:leading-[0.88]">
          <span className="block">Every Idea</span>
          <span className="block">Has</span>
          <span className="block text-[#2563ff]">Meaning</span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] font-medium leading-7 text-black/58 sm:mt-8 sm:max-w-2xl sm:text-[18px] sm:leading-8">
          A modern digital space for ideas, stories, products, creativity, and meaningful experiences.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row">
          <Link
            className="inline-flex min-w-44 justify-center rounded-full bg-[#2563ff] px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_20px_45px_rgba(37,99,255,0.26)] transition hover:-translate-y-0.5 hover:bg-[#0f4ff2]"
            href="#works"
          >
            Explore Makna
          </Link>
          <Link
            className="inline-flex min-w-44 justify-center rounded-full border border-black/10 bg-white/70 px-7 py-3.5 text-[14px] font-bold text-black shadow-[0_18px_45px_rgba(0,0,0,0.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-black/18 hover:bg-white"
            href="https://www.instagram.com/rex.orange777/"
            rel="noreferrer"
            target="_blank"
          >
            Let&apos;s Collab
          </Link>
        </div>
      </section>

      <section className="relative -mt-12 px-4 pb-24 sm:-mt-16 sm:px-6 lg:px-8" id="works">
        <PortfolioGrid projects={projects} />
      </section>

      <MaknaFooter />
    </main>
  );
}
