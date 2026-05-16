"use client";

import Image from "next/image";
import { useState } from "react";

import { PortfolioModal } from "@/components/portfolio/portfolio-modal";
import type { ProjectCard } from "@/lib/data/projects";

type PortfolioGridProps = {
  projects: ProjectCard[];
};

const filterTabs = ["Stories", "Products", "Visuals", "Experiments", "Journals"] as const;

const cardHeights = [
  "h-[420px] sm:h-[540px]",
  "h-[360px] sm:h-[440px]",
  "h-[460px] sm:h-[620px]",
  "h-[380px] sm:h-[500px]",
  "h-[430px] sm:h-[560px]"
];

function getEditorialCategory(index: number) {
  return filterTabs[index % filterTabs.length];
}

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [activeProject, setActiveProject] = useState<ProjectCard | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const cards = projects.map((project, index) => ({
    editorialCategory: getEditorialCategory(index),
    project
  }));

  const visibleCards = cards.filter(({ editorialCategory, project }) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesFilter = !activeFilter || editorialCategory === activeFilter;

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return [project.title, project.description, project.category, editorialCategory]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 rounded-[999px] border border-white/70 bg-white/[0.72] p-2 shadow-[0_24px_80px_rgba(20,24,36,0.12)] backdrop-blur-2xl">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <input
              aria-label="Search works"
              className="min-h-12 flex-1 rounded-full border border-black/[0.06] bg-[#f5f5f7]/90 px-5 text-[14px] font-semibold text-black outline-none transition placeholder:text-black/34 focus:border-[#2563ff]/45 focus:bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ideas, products, stories"
              type="search"
              value={query}
            />

            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab;

                return (
                  <button
                    className={`shrink-0 rounded-full px-4 py-3 text-[12px] font-bold transition ${
                      isActive
                        ? "bg-[#2563ff] text-white shadow-[0_14px_30px_rgba(37,99,255,0.24)]"
                        : "bg-white text-black/56 hover:bg-black hover:text-white"
                    }`}
                    key={tab}
                    onClick={() => setActiveFilter(isActive ? null : tab)}
                    type="button"
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {visibleCards.length > 0 ? (
          <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
            {visibleCards.map(({ editorialCategory, project }, index) => {
              const logoVersion = new Date(project.updatedAt).getTime();

              return (
                <button
                  className={`group mb-5 block w-full break-inside-avoid overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-left shadow-[0_22px_80px_rgba(18,22,34,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_100px_rgba(18,22,34,0.16)] ${cardHeights[index % cardHeights.length]}`}
                  key={project.id}
                  onClick={() => setActiveProject(project)}
                  type="button"
                >
                  <article className="relative h-full overflow-hidden">
                    <Image
                      alt={`${project.title} visual`}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      src={`/api/project-logo/${project.id}?v=${logoVersion}`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.1)_44%,rgba(0,0,0,0.34))]" />

                    <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
                      <span className="rounded-full border border-white/70 bg-white/[0.78] px-3 py-1.5 text-[11px] font-black uppercase text-[#2563ff] shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                        {project.category}
                      </span>
                      <span className="rounded-full border border-white/60 bg-white/[0.58] px-3 py-1.5 text-[11px] font-bold text-black/52 backdrop-blur-xl">
                        {editorialCategory}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <div className="rounded-[22px] border border-white/70 bg-white/[0.86] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:p-5">
                        <h2 className="text-[24px] font-black leading-none tracking-normal text-black sm:text-[30px]">
                          {project.title}
                        </h2>
                        <p className="mt-3 line-clamp-2 text-[14px] font-medium leading-6 text-black/56">
                          {project.description}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-4">
                          <span className="text-[12px] font-bold text-black/38">
                            {project.featured ? "Featured" : "Selected"}
                          </span>
                          <span className="rounded-full bg-black px-4 py-2 text-[12px] font-bold text-white transition group-hover:bg-[#2563ff]">
                            Klik Aplikasi
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-10 text-center shadow-[0_22px_80px_rgba(18,22,34,0.08)]">
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
