"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {};

type LoginFormProps = {
  notice?: string;
};

export function LoginForm({ notice }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <section className="mx-auto w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_24px_90px_rgba(18,22,34,0.12)] sm:p-8">
      <div className="mb-8">
        <p className="text-[12px] font-black uppercase text-[#2563ff]">Welcome back</p>
        <h2 className="mt-3 text-[34px] font-black leading-none tracking-normal text-black">Sign In</h2>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[12px] font-black uppercase text-black/42" htmlFor="username">
            Username
          </label>
          <input
            className="w-full rounded-[18px] border border-black/[0.08] bg-[#f5f5f7] px-5 py-4 text-[15px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            id="username"
            name="username"
            placeholder="admin"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-black uppercase text-black/42" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-[18px] border border-black/[0.08] bg-[#f5f5f7] px-5 py-4 text-[15px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            id="password"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </div>

        <div className="flex justify-end">
          <Link className="text-xs font-bold text-[#2563ff] hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {notice ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</p> : null}
        {state.error ? <p className="rounded-2xl bg-[#2563ff]/10 px-4 py-3 text-sm font-bold text-[#2563ff]">{state.error}</p> : null}

        <button
          className="w-full rounded-full bg-black px-6 py-4 text-[14px] font-black text-white shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Loading" : "Sign In"}
        </button>
      </form>
    </section>
  );
}
