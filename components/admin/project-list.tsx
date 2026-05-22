"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { deleteProjectAction } from "@/lib/actions/projects";
import type { ProjectCard } from "@/lib/data/projects";
import { moveItem } from "@/lib/utils";

type ProjectListProps = {
  onReorder: (projectIds: string[]) => Promise<{ error?: string }>;
  projects: ProjectCard[];
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
    <div className="space-y-3">
      {orderedProjects.length === 0 ? (
        <div className="rounded-[20px] border border-black/[0.06] bg-white p-6 text-center shadow-[0_18px_55px_rgba(18,22,34,0.07)]">
          <p className="text-[14px] font-bold text-black/52">No projects yet.</p>
        </div>
      ) : null}

      {orderedProjects.map((project) => {
        const deleteAction = deleteProjectAction.bind(null, project.id);

        return (
          <div
            className="group flex cursor-move flex-col gap-3 rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_18px_55px_rgba(18,22,34,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_72px_rgba(18,22,34,0.10)] data-[dragging=true]:scale-[0.99] data-[dragging=true]:border-[#2563ff]/35 sm:flex-row sm:items-center sm:justify-between sm:p-5"
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
                <span className="text-[12px] font-black text-black/22 transition group-hover:text-[#2563ff]">::</span>
                <p className="text-[11px] font-black uppercase tracking-normal text-[#2563ff]">{project.category}</p>
              </div>
              <h2 className="text-[23px] font-black leading-none text-black sm:text-[30px]">{project.title}</h2>
              <p className="max-w-2xl text-[13px] font-medium leading-6 text-black/56">{project.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                className="rounded-full bg-black px-3.5 py-2 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-[#2563ff]"
                href={`/admin/${project.id}/edit`}
              >
                Edit
              </Link>
              <form action={deleteAction}>
                <button
                  className="rounded-full border border-black/10 bg-[#f5f5f7] px-3.5 py-2 text-[12px] font-black text-black/52 transition hover:border-[#2563ff]/30 hover:text-[#2563ff]"
                  type="submit"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        );
      })}

      {isPending ? <p className="text-sm font-bold text-black/42">Saving order...</p> : null}
      {error ? <p className="text-sm font-bold text-[#2563ff]">{error}</p> : null}
    </div>
  );
}
