"use client";

import { useActionState } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <GlassCard className="mx-auto w-full max-w-md p-6 sm:p-8">
      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]" htmlFor="username">
            Username
          </label>
          <input
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition placeholder:text-[color:var(--ui-soft)] focus:border-[color:var(--ui-soft)]"
            id="username"
            name="username"
            placeholder="admin"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)]" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-sm text-[color:var(--ui-strong)] outline-none transition placeholder:text-[color:var(--ui-soft)] focus:border-[color:var(--ui-soft)]"
            id="password"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </div>

        {state.error ? <p className="text-sm text-[#ff8e75]">{state.error}</p> : null}

        <button
          className="w-full rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--ui-muted)] transition hover:border-[color:var(--ui-soft)] hover:text-accent disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Loading" : "Login"}
        </button>
      </form>
    </GlassCard>
  );
}
