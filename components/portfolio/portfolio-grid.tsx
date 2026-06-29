"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { FadeIn } from "@/components/portfolio/fade-in";
import type { ProjectCard } from "@/lib/data/projects";

const PortfolioModal = dynamic(
  () => import("@/components/portfolio/portfolio-modal").then(m => m.PortfolioModal),
  { ssr: false }
);

type PortfolioGridProps = {
  projects: ProjectCard[];
};

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [activeProject, setActiveProject] = useState<ProjectCard | null>(null);
  const [query, setQuery] = useState("");

  const visibleProjects = projects.filter((project) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [project.title, project.description, project.category]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div
          className="mx-auto mb-10 max-w-3xl rounded-[20px] border border-black/[0.04] bg-white p-1.5 shadow-[0_8px_40px_rgba(18,22,34,0.06)] transition-all duration-500"
          style={{ animation: query ? "borderGlow 3s ease-in-out infinite" : "none" }}
        >
          <div className="relative">
            {/* Search icon */}
            <svg
              className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/25"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <input
              aria-label="Search works"
              className="min-h-[3.25rem] w-full rounded-[16px] border border-transparent bg-[#f8f8fa] py-0 pl-12 pr-6 text-[14px] font-semibold text-black outline-none transition-all duration-300 placeholder:text-black/28 hover:bg-[#f3f3f6] focus:border-[#2563ff]/25 focus:bg-white focus:ring-2 focus:ring-[#2563ff]/15 sm:px-7 sm:text-[15px]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search works..."
              type="search"
              value={query}
            />

            {/* Clear button */}
            {query ? (
              <button
                aria-label="Clear search"
                className="absolute right-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
                onClick={() => setQuery("")}
                type="button"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {visibleProjects.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visibleProjects.map((project, index) => {
              const logoVersion = new Date(project.updatedAt).getTime();

              return (
                <FadeIn delay={index * 80} key={project.id}>
                <button
                  className="group relative block w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-[0_22px_80px_rgba(18,22,34,0.10)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_100px_rgba(18,22,34,0.18),0_0_40px_-4px_rgba(37,99,255,0.15)] hover:border-[#2563ff]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 focus-visible:ring-offset-2 aspect-square"
                  onClick={() => setActiveProject(project)}
                  style={{ animation: `subtleFloat ${4 + index * 0.6}s ease-in-out infinite` }}
                  type="button"
                >
                  {/* Glow ring on hover */}
                  <div aria-hidden="true" className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(135deg, rgba(37,99,255,0.18), rgba(139,92,246,0.12), rgba(37,99,255,0.08))", filter: "blur(1px)" }} />

                  <article className="relative h-full overflow-hidden rounded-2xl">
                    <Image
                      alt={`${project.title} visual`}
                      className="object-cover transition duration-700 group-hover:scale-110"
                      fill
                      quality={85}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      src={`/api/project-logo/${project.id}?v=${logoVersion}`}
                    />
                    {/* Shine overlay on hover */}
                    <div aria-hidden="true" className="card-shine-overlay" />
                    {/* Extra glow overlay on hover */}
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#2563ff]/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.12)_44%,rgba(0,0,0,0.38))]" />

                    <div className="absolute left-2 top-2 flex items-center gap-1 sm:left-3 sm:top-3">
                      <span className="animate-pulse-badge border border-white/70 bg-white/[0.82] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#2563ff] shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl rounded-full sm:px-3">
                        {project.category}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                      <div className="rounded-xl border border-white/60 bg-white/[0.88] p-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-all duration-500 group-hover:bg-white/[0.94] group-hover:border-white/80 sm:p-3">
                        <h2 className="text-[13px] font-black leading-tight tracking-normal text-black transition-colors duration-300 group-hover:text-[#2563ff] sm:text-[15px]">
                          {project.title}
                        </h2>
                        <p className="mt-1 line-clamp-1 text-[10px] font-medium leading-snug text-black/56 sm:mt-1.5 sm:text-[11px]">
                          {project.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2 sm:mt-2.5">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-black/38 sm:text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2563ff]/60 inline-block" />
                            {project.featured ? "Featured" : "Selected"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-black px-2.5 py-1 text-[9px] font-bold text-white transition-all duration-300 group-hover:bg-[#2563ff] group-hover:shadow-[0_8px_24px_rgba(37,99,255,0.35)] sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                            Klik Aplikasi
                            <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </button>
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <div className="border border-black/[0.06] bg-white p-10 text-center shadow-[0_22px_80px_rgba(18,22,34,0.08)]">
            <p className="text-[14px] font-bold text-black/52">No works match this search.</p>
          </div>
        )}
      </div>

      {activeProject ? (
        <PortfolioModal project={activeProject} onClose={() => setActiveProject(null)} />
      ) : null}
    </>
  );
}
