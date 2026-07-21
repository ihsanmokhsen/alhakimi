"use client";

import Link from "next/link";
import { useActionState } from "react";

import { forgotPasswordAction, type ForgotPasswordFormState } from "@/lib/actions/auth";

const initialState: ForgotPasswordFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <section className="mx-auto w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_24px_90px_rgba(18,22,34,0.12)] sm:p-8">
      <div className="mb-8">
        <p className="text-[12px] font-black uppercase text-[#ff4f0a]">Reset access</p>
        <h2 className="mt-3 text-[34px] font-black leading-none tracking-normal text-[color:var(--text)]">Forgot Password</h2>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[12px] font-black uppercase text-[color:var(--text)]/42" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-[18px] border border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-5 py-4 text-[15px] font-semibold text-[color:var(--text)] outline-none transition placeholder:text-[color:var(--text)]/30 focus:border-[#ff4f0a]/45 focus:bg-[color:var(--surface)]"
            id="email"
            name="email"
            placeholder="admin@yourdomain.com"
            required
            type="email"
          />
        </div>

        {state.error ? <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">{state.error}</p> : null}
        {state.success ? (
          <p className="rounded-2xl bg-[#ff4f0a]/10 px-4 py-3 text-sm font-bold text-[#ff4f0a]">{state.success}</p>
        ) : null}

        <button
          className="w-full rounded-full bg-black px-6 py-4 text-[14px] font-black text-white shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ff4f0a] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Sending" : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link className="text-xs font-bold text-[#ff4f0a] hover:underline" href="/login">
          Back to sign in
        </Link>
      </div>
    </section>
  );
}
