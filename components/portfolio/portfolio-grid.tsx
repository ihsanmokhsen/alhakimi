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
            className="group animate-works-fade-up text-left transition duration-700 hover:-translate-y-1"
            key={project.id}
            onClick={() => setActiveProject(project)}
            style={{ animationDelay: `${Math.min(project.position ?? 0, 8) * 90}ms` }}
            type="button"
          >
            <GlassCard
              className={
                compact
                  ? "flex min-h-[104px] flex-col justify-between overflow-hidden border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-2.5 transition duration-700 group-hover:border-white/16 group-hover:bg-white/[0.08] group-hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)] sm:min-h-[124px] sm:p-3"
                  : "flex min-h-[138px] flex-col justify-between overflow-hidden border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-3 transition duration-700 group-hover:border-white/16 group-hover:bg-white/[0.08] group-hover:shadow-[0_20px_55px_rgba(0,0,0,0.24)] sm:min-h-[164px] sm:p-4"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[7px] uppercase tracking-[0.18em] text-[color:var(--public-text-soft)]">
                  {project.featured ? "Featured" : "Selected"}
                </span>
                <span className="h-2 w-2 rounded-full bg-[color:var(--public-text-faint)] transition duration-300 group-hover:bg-accent" />
              </div>

              <div>
                <p className="text-[7px] uppercase tracking-[0.16em] text-[color:var(--public-text-soft)]">{project.category}</p>
                <h2
                  className={
                    compact
                      ? "mt-1.5 text-[11px] font-semibold leading-none tracking-tight text-[color:var(--public-text-strong)] sm:text-[13px]"
                      : "mt-2.5 text-[12px] font-semibold leading-none tracking-tight text-[color:var(--public-text-strong)] sm:text-[16px]"
                  }
                >
                  {project.title}
                </h2>
              </div>

              <p
                className={
                  compact
                    ? "line-clamp-2 text-[7px] leading-3.5 text-[color:var(--public-text-muted)] sm:text-[8px] sm:leading-4"
                    : "line-clamp-2 text-[8px] leading-4 text-[color:var(--public-text-muted)] sm:text-[9px] sm:leading-4.5"
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
