"use client";

import { useActionState } from "react";

import type { JournalFormState } from "@/lib/actions/journals";
import { GlassCard } from "@/components/ui/glass-card";

type JournalFormProps = {
  action: (state: JournalFormState, formData: FormData) => Promise<JournalFormState>;
};

const initialState: JournalFormState = {};

function getDefaultDatetimeValue() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function JournalForm({ action }: JournalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <GlassCard className="p-6 sm:p-8">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Title</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              name="title"
              required
              type="text"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Time</span>
            <input
              className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
              defaultValue={getDefaultDatetimeValue()}
              name="publishedAt"
              required
              type="datetime-local"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]">Writing</span>
          <textarea
            className="min-h-40 w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm leading-7 text-[color:var(--ui-strong)] outline-none transition focus:border-[color:var(--ui-soft)]"
            name="content"
            required
          />
        </label>

        {state.error ? <p className="text-sm text-[#ff8e75]">{state.error}</p> : null}

        <button
          className="rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ui-muted)] transition hover:border-[color:var(--ui-soft)] hover:text-accent disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : "Save journal"}
        </button>
      </form>
    </GlassCard>
  );
}
