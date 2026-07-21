"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { FadeIn } from "@/components/portfolio/fade-in";
import type { ProjectCard } from "@/lib/data/projects";

const PortfolioModal = dynamic(
  () => import("@/components/portfolio/portfolio-modal").then((module) => module.PortfolioModal),
  { ssr: false }
);

type PortfolioGridProps = {
  projects: ProjectCard[];
};

type ViewMode = "grid" | "list";

function GridModeIcon() {
  return (
    <span aria-hidden="true" className="grid h-4 w-4 grid-cols-2 gap-0.5">
      <span className="bg-current" />
      <span className="bg-current" />
      <span className="bg-current" />
      <span className="bg-current" />
    </span>
  );
}

function ListModeIcon() {
  return (
    <span aria-hidden="true" className="flex h-4 w-4 flex-col justify-center gap-1">
      <span className="h-0.5 w-full bg-current" />
      <span className="h-0.5 w-full bg-current" />
      <span className="h-0.5 w-full bg-current" />
    </span>
  );
}

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [activeProject, setActiveProject] = useState<ProjectCard | null>(null);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProjects = normalizedQuery
    ? projects.filter((project) =>
        [project.title, project.description, project.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : projects;

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="w-full max-w-3xl rounded-[20px] border border-black/[0.04] bg-[color:var(--surface)] p-1.5 shadow-[0_8px_40px_rgba(18,22,34,0.06)] transition-all duration-300"
            style={{ animation: query ? "borderGlow 3s ease-in-out infinite" : "none" }}
          >
            <div className="relative">
              <input
                aria-label="Search works"
                className="min-h-[3.25rem] w-full rounded-[16px] border border-transparent bg-[#f4f5f4] px-5 pr-12 text-[14px] font-semibold text-[color:var(--text)] outline-none transition duration-300 placeholder:text-[color:var(--text)]/28 hover:bg-[#e8ebe9] focus:border-[#ff4f0a]/25 focus:bg-[color:var(--surface)] focus:ring-2 focus:ring-[#ff4f0a]/15 sm:text-[15px]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search works..."
                type="search"
                value={query}
              />

              {query ? (
                <button
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[18px] leading-none text-[color:var(--text)]/30 transition hover:bg-black/5 hover:text-[color:var(--text)]/60"
                  onClick={() => setQuery("")}
                  type="button"
                >
                  &times;
                </button>
              ) : null}
            </div>
          </div>

          <div
            aria-label="Tampilan works"
            className="inline-flex w-fit shrink-0 rounded-[14px] border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-[0_8px_28px_rgba(18,22,34,0.06)]"
            role="group"
          >
            <button
              aria-pressed={viewMode === "grid"}
              className={`inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3.5 text-[12px] font-black transition ${
                viewMode === "grid"
                  ? "bg-[#ff4f0a] text-white shadow-[0_8px_20px_rgba(255,79,10,0.22)]"
                  : "text-[color:var(--text)]/48 hover:bg-[color:var(--bg-chip)] hover:text-[color:var(--text)]"
              }`}
              onClick={() => setViewMode("grid")}
              type="button"
            >
              <GridModeIcon />
              Ikon
            </button>
            <button
              aria-pressed={viewMode === "list"}
              className={`inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3.5 text-[12px] font-black transition ${
                viewMode === "list"
                  ? "bg-[#ff4f0a] text-white shadow-[0_8px_20px_rgba(255,79,10,0.22)]"
                  : "text-[color:var(--text)]/48 hover:bg-[color:var(--bg-chip)] hover:text-[color:var(--text)]"
              }`}
              onClick={() => setViewMode("list")}
              type="button"
            >
              <ListModeIcon />
              Baris
            </button>
          </div>
        </div>

        {visibleProjects.length > 0 && viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visibleProjects.map((project, index) => {
              const logoVersion = new Date(project.updatedAt).getTime();

              return (
                <FadeIn delay={Math.min(index * 60, 360)} key={project.id}>
                  <button
                    className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-left shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-[#ff4f0a]/20 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/50 focus-visible:ring-offset-2"
                    onClick={() => setActiveProject(project)}
                    type="button"
                  >
                    <article className="relative h-full overflow-hidden rounded-2xl">
                      <Image
                        alt={`${project.title} visual`}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        quality={85}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        src={`/api/project-logo/${project.id}?v=${logoVersion}`}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.12)_44%,rgba(0,0,0,0.38))]" />

                      <span className="absolute left-2 top-2 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[9px] font-black uppercase text-[#ff4f0a] shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:left-3 sm:top-3 sm:px-3">
                        {project.category}
                      </span>

                      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                        <div className="rounded-xl border border-white/60 bg-white/90 p-2.5 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-3">
                          <h2 className="text-[13px] font-black leading-tight text-black transition group-hover:text-[#ff4f0a] sm:text-[15px]">
                            {project.title}
                          </h2>
                          <p className="mt-1 line-clamp-1 text-[10px] font-medium leading-snug text-black/56 sm:text-[11px]">
                            {project.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[9px] font-bold text-black/38 sm:text-[10px]">
                              {project.featured ? "Featured" : "Selected"}
                            </span>
                            <span className="rounded-lg bg-black px-2.5 py-1 text-[9px] font-bold text-white transition group-hover:bg-[#ff4f0a] sm:px-3 sm:text-[10px]">
                              Buka
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
        ) : null}

        {visibleProjects.length > 0 && viewMode === "list" ? (
          <div className="space-y-3">
            {visibleProjects.map((project, index) => {
              const logoVersion = new Date(project.updatedAt).getTime();

              return (
                <FadeIn delay={Math.min(index * 45, 270)} key={project.id}>
                  <button
                    className="group flex min-h-28 w-full items-center gap-4 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-left shadow-[0_12px_45px_rgba(18,22,34,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[#ff4f0a]/20 hover:shadow-[0_18px_60px_rgba(18,22,34,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/50 sm:gap-5 sm:p-4"
                    onClick={() => setActiveProject(project)}
                    type="button"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[color:var(--surface-muted)] sm:h-24 sm:w-24">
                      <Image
                        alt={`${project.title} visual`}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        quality={85}
                        sizes="96px"
                        src={`/api/project-logo/${project.id}?v=${logoVersion}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-black uppercase text-[#ff4f0a] sm:text-[11px]">
                        {project.category}
                      </p>
                      <h2 className="mt-1 truncate text-[17px] font-black leading-tight text-[color:var(--text)] transition group-hover:text-[#ff4f0a] sm:text-[21px]">
                        {project.title}
                      </h2>
                      <p className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-5 text-[color:var(--text)]/52 sm:text-[13px] sm:leading-6">
                        {project.description}
                      </p>
                    </div>

                    <span className="hidden shrink-0 bg-[color:var(--inverse-surface)] px-4 py-2.5 text-[11px] font-black text-[color:var(--inverse-text)] transition group-hover:bg-[#ff4f0a] group-hover:text-white sm:inline-flex">
                      Buka aplikasi
                    </span>
                  </button>
                </FadeIn>
              );
            })}
          </div>
        ) : null}

        {visibleProjects.length === 0 ? (
          <div className="border border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-[14px] font-bold text-[color:var(--text)]/52">No works match this search.</p>
          </div>
        ) : null}
      </div>

      {activeProject ? (
        <PortfolioModal project={activeProject} onClose={() => setActiveProject(null)} />
      ) : null}
    </>
  );
}
