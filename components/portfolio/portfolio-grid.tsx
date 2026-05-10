"use client";

import Image from "next/image";
import { useState } from "react";

import { PortfolioModal } from "@/components/portfolio/portfolio-modal";
import { GlassCard } from "@/components/ui/glass-card";
import type { ProjectCard } from "@/lib/data/projects";

type PortfolioGridProps = {
  compact?: boolean;
  projects: ProjectCard[];
};

export function PortfolioGrid({ compact = false, projects }: PortfolioGridProps) {
  const [activeProject, setActiveProject] = useState<ProjectCard | null>(null);

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

              <div
                className={
                  compact
                    ? "mt-1.5 grid flex-1 grid-cols-[minmax(0,1fr)_84px] gap-2 sm:grid-cols-[minmax(0,1fr)_96px]"
                    : "mt-2.5 grid flex-1 grid-cols-[minmax(0,1fr)_94px] gap-2.5 sm:grid-cols-[minmax(0,1fr)_118px]"
                }
              >
                <div className="flex min-w-0 flex-col justify-between">
                  <div>
                    <p className="text-[7px] uppercase tracking-[0.16em] text-[color:var(--public-text-soft)]">{project.category}</p>
                    <h2
                      className={
                        compact
                          ? "mt-1.5 text-[11px] font-semibold leading-none tracking-tight text-[color:var(--public-text-strong)] sm:text-[13px]"
                          : "mt-2 text-[12px] font-semibold leading-none tracking-tight text-[color:var(--public-text-strong)] sm:text-[16px]"
                      }
                    >
                      {project.title}
                    </h2>
                  </div>
                  <p
                    className={
                      compact
                        ? "mt-2 line-clamp-2 text-[7px] leading-3.5 text-[color:var(--public-text-muted)] sm:text-[8px] sm:leading-4"
                        : "mt-2.5 line-clamp-2 text-[8px] leading-4 text-[color:var(--public-text-muted)] sm:text-[9px] sm:leading-4.5"
                    }
                  >
                    {project.description}
                  </p>
                </div>

                <div className="relative min-h-[78px] overflow-hidden rounded-xl border border-white/12 bg-white/5 sm:min-h-[96px]">
                  <Image
                    alt={`${project.title} logo`}
                    className="object-cover"
                    fill
                    sizes={compact ? "(max-width: 640px) 84px, 96px" : "(max-width: 640px) 94px, 118px"}
                    src={`/api/project-logo/${project.id}`}
                  />
                </div>
              </div>
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
