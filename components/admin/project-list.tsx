"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { Project } from "@prisma/client";

import { deleteProjectAction } from "@/lib/actions/projects";
import { GlassCard } from "@/components/ui/glass-card";
import { moveItem } from "@/lib/utils";

type ProjectListProps = {
  onReorder: (projectIds: string[]) => Promise<{ error?: string }>;
  projects: Project[];
};

export function ProjectList({ onReorder, projects }: ProjectListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [orderedProjects, setOrderedProjects] = useState(projects);
  const [isPending, startReorderTransition] = useTransition();

  useEffect(() => {
    setOrderedProjects(projects);
  }, [projects]);

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId || isPending) {
      setDraggedId(null);
      return;
    }

    const fromIndex = orderedProjects.findIndex((project) => project.id === draggedId);
    const toIndex = orderedProjects.findIndex((project) => project.id === targetId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      return;
    }

    const nextProjects = moveItem(orderedProjects, fromIndex, toIndex);
    setOrderedProjects(nextProjects);
    setError(undefined);
    setDraggedId(null);

    startReorderTransition(async () => {
      const result = await onReorder(nextProjects.map((project) => project.id));

      if (result.error) {
        setError(result.error);
        setOrderedProjects(projects);
      }
    });
  }

  return (
    <div className="space-y-4">
      {orderedProjects.map((project) => {
        const deleteAction = deleteProjectAction.bind(null, project.id);

        return (
          <GlassCard
            className="flex cursor-move flex-col gap-4 p-5 transition duration-300 data-[dragging=true]:scale-[0.99] data-[dragging=true]:border-[#F44A22]/40 sm:flex-row sm:items-center sm:justify-between"
            data-dragging={draggedId === project.id}
            draggable
            key={project.id}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={() => setDraggedId(project.id)}
            onDrop={() => handleDrop(project.id)}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[color:var(--ui-soft)]">::</span>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--ui-soft)]">{project.category}</p>
              </div>
              <h2 className="text-xl font-semibold text-[color:var(--ui-strong)]">{project.title}</h2>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--ui-muted)]">{project.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                className="rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-muted)] transition hover:text-accent"
                href={`/admin/${project.id}/edit`}
              >
                Edit
              </Link>
              <form action={deleteAction}>
                <button
                  className="rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-muted)] transition hover:text-[#ff8e75]"
                  type="submit"
                >
                  Delete
                </button>
              </form>
            </div>
          </GlassCard>
        );
      })}

      {isPending ? <p className="text-sm text-[color:var(--ui-soft)]">Saving order...</p> : null}
      {error ? <p className="text-sm text-[#ff8e75]">{error}</p> : null}
    </div>
  );
}
