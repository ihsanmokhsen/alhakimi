"use client";

import { useState } from "react";
import type { Project } from "@prisma/client";

import { PortfolioModal } from "@/components/portfolio/portfolio-modal";
import { GlassCard } from "@/components/ui/glass-card";

type PortfolioGridProps = {
  compact?: boolean;
  projects: Project[];
};

export function PortfolioGrid({ compact = false, projects }: PortfolioGridProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <>
      <div className={compact ? "grid h-full gap-2.5 sm:grid-cols-2 sm:gap-3" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
        {projects.map((project) => (
          <button
            className="group text-left transition duration-500 hover:-translate-y-1"
            key={project.id}
            onClick={() => setActiveProject(project)}
            type="button"
          >
            <GlassCard
              className={
                compact
                  ? "flex min-h-[104px] flex-col justify-between overflow-hidden p-2.5 transition duration-500 group-hover:border-white/16 group-hover:bg-white/[0.08] sm:min-h-[124px] sm:p-3"
                  : "flex min-h-[138px] flex-col justify-between overflow-hidden p-3 transition duration-500 group-hover:border-white/16 group-hover:bg-white/[0.08] sm:min-h-[164px] sm:p-4"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[7px] uppercase tracking-[0.18em] text-[color:var(--ui-soft)]">
                  {project.featured ? "Featured" : "Selected"}
                </span>
                <span className="h-2 w-2 rounded-full bg-[color:var(--ui-soft)]/40 transition duration-300 group-hover:bg-accent" />
              </div>

              <div>
                <p className="text-[7px] uppercase tracking-[0.16em] text-[color:var(--ui-soft)]">{project.category}</p>
                <h2
                  className={
                    compact
                      ? "mt-1.5 max-w-[14ch] text-[11px] font-semibold leading-none tracking-tight text-[color:var(--ui-strong)] sm:text-[13px]"
                      : "mt-2.5 max-w-[14ch] text-[12px] font-semibold leading-none tracking-tight text-[color:var(--ui-strong)] sm:text-[16px]"
                  }
                >
                  {project.title}
                </h2>
              </div>

              <p
                className={
                  compact
                    ? "line-clamp-2 max-w-[30ch] text-[7px] leading-3.5 text-[color:var(--ui-muted)] sm:text-[8px] sm:leading-4"
                    : "line-clamp-2 max-w-[30ch] text-[8px] leading-4 text-[color:var(--ui-muted)] sm:text-[9px] sm:leading-4.5"
                }
              >
                {project.description}
              </p>
            </GlassCard>
          </button>
        ))}
      </div>

      {activeProject ? (
        <PortfolioModal project={activeProject} onClose={() => setActiveProject(null)} />
      ) : null}
    </>
  );
}
