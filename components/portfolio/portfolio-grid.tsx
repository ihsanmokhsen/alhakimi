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
        <div className="mx-auto mb-10 max-w-3xl rounded-[20px] border border-white/70 bg-white/[0.72] p-2 shadow-[0_24px_80px_rgba(20,24,36,0.12)] backdrop-blur-2xl">
          <input
            aria-label="Search works"
            className="min-h-[3.25rem] w-full rounded-[14px] border border-black/[0.06] bg-[#f5f5f7]/90 px-6 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/34 focus:border-[#2563ff]/45 focus:bg-white focus:ring-2 focus:ring-[#2563ff]/20 sm:px-7 sm:text-[15px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search works"
            type="search"
            value={query}
          />
        </div>

        {visibleProjects.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleProjects.map((project, index) => {
              const logoVersion = new Date(project.updatedAt).getTime();

              return (
                <FadeIn delay={index * 80} key={project.id}>
                <button
                  className="group block w-full overflow-hidden border border-black/[0.06] bg-white text-left shadow-[0_22px_80px_rgba(18,22,34,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_100px_rgba(18,22,34,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 focus-visible:ring-offset-2 aspect-square"
                  onClick={() => setActiveProject(project)}
                  type="button"
                >
                  <article className="relative h-full overflow-hidden">
                    <Image
                      alt={`${project.title} visual`}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fill
                      quality={85}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      src={`/api/project-logo/${project.id}?v=${logoVersion}`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.1)_44%,rgba(0,0,0,0.34))]" />

                    <div className="absolute left-2 top-2 flex items-center gap-1 sm:left-3 sm:top-3">
                      <span className="border border-white/70 bg-white/[0.78] px-2 py-1 text-[9px] font-black uppercase text-[#2563ff] shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                        {project.category}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                      <div className="border border-white/70 bg-white/[0.86] p-2 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-3">
                        <h2 className="text-[13px] font-black leading-tight tracking-normal text-black sm:text-[15px]">
                          {project.title}
                        </h2>
                        <p className="mt-1 line-clamp-1 text-[10px] font-medium leading-snug text-black/56 sm:mt-1.5 sm:text-[11px]">
                          {project.description}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-2">
                          <span className="text-[9px] font-bold text-black/38 sm:text-[10px]">
                            {project.featured ? "Featured" : "Selected"}
                          </span>
                          <span className="bg-black px-2 py-1 text-[9px] font-bold text-white transition group-hover:bg-[#2563ff] sm:px-3 sm:py-1.5 sm:text-[10px]">
                            Klik Aplikasi
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
