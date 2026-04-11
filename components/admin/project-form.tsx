"use client";

import { useActionState } from "react";
import type { Project } from "@prisma/client";

import type { ProjectFormState } from "@/lib/actions/projects";
import { GlassCard } from "@/components/ui/glass-card";

type ProjectFormProps = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  project?: Project | null;
  submitLabel: string;
};

const initialState: ProjectFormState = {};

export function ProjectForm({ action, project, submitLabel }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <GlassCard className="p-6 sm:p-8">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Title</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              defaultValue={project?.title ?? ""}
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Category</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              defaultValue={project?.category ?? "Web App"}
              name="category"
              required
              type="text"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">URL</span>
          <input
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
            defaultValue={project?.url ?? ""}
            name="url"
            required
            type="url"
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Description</span>
          <textarea
            className="min-h-36 w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm leading-7 text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
            defaultValue={project?.description ?? ""}
            name="description"
            required
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-muted)]">
          <input
            className="h-4 w-4 accent-[#F44A22]"
            defaultChecked={project?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          Show as a featured project
        </label>

        {state.error ? <p className="text-sm text-[#ff8e75]">{state.error}</p> : null}

        <button
          className="rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ui-muted)] transition hover:border-[color:var(--ui-soft)] hover:text-accent disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : submitLabel}
        </button>
      </form>
    </GlassCard>
  );
}
