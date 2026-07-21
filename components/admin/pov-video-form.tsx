"use client";

import { startTransition, useActionState } from "react";

import type { PovVideoFormState } from "@/lib/actions/pov-videos";

type PovVideoFormProps = {
  action: (state: PovVideoFormState, formData: FormData) => Promise<PovVideoFormState>;
};

const initialState: PovVideoFormState = {};

export function PovVideoForm({ action }: PovVideoFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <section className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_20px_70px_rgba(18,22,34,0.09)] sm:p-6">
      <form action={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">Title</span>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
              name="title"
              placeholder="e.g. POV: documenting my boring life"
              required
              type="text"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[12px] font-black uppercase text-[color:var(--text)]/42">YouTube URL</span>
            <input
              className="w-full rounded-[16px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-4 py-3 text-[14px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
              name="youtubeUrl"
              placeholder="https://youtube.com/shorts/..."
              required
              type="url"
            />
          </label>
        </div>

        <p className="text-[12px] font-medium text-[color:var(--text)]/42">
          Paste any YouTube URL (Shorts, watch, or youtu.be). It will be displayed in portrait mode.
        </p>

        {state.error ? (
          <p className="rounded-2xl bg-[#ff4f0a]/10 px-4 py-3 text-sm font-bold text-[#ff4f0a]">{state.error}</p>
        ) : null}

        <button
          className="rounded-full bg-black px-5 py-3 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#ff4f0a] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving" : "Add POV video"}
        </button>
      </form>
    </section>
  );
}
