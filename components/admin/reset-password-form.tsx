"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction, type ResetPasswordFormState } from "@/lib/actions/auth";

const initialState: ResetPasswordFormState = {};

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <section className="mx-auto w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_24px_90px_rgba(18,22,34,0.12)] sm:p-8">
      <div className="mb-8">
        <p className="text-[12px] font-black uppercase text-[#2563ff]">Secure update</p>
        <h2 className="mt-3 text-[34px] font-black leading-none tracking-normal text-black">Reset Password</h2>
      </div>

      <form action={formAction} className="space-y-5">
        <input name="token" type="hidden" value={token} />

        <div className="space-y-2">
          <label className="text-[12px] font-black uppercase text-black/42" htmlFor="password">
            New password
          </label>
          <input
            className="w-full rounded-[18px] border border-black/[0.08] bg-[#f5f5f7] px-5 py-4 text-[15px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            id="password"
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-black uppercase text-black/42" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            className="w-full rounded-[18px] border border-black/[0.08] bg-[#f5f5f7] px-5 py-4 text-[15px] font-semibold text-black outline-none transition placeholder:text-black/30 focus:border-[#2563ff]/45 focus:bg-white"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repeat new password"
            required
            type="password"
          />
        </div>

        {state.error ? <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600">{state.error}</p> : null}

        <button
          className="w-full rounded-full bg-black px-6 py-4 text-[14px] font-black text-white shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] disabled:translate-y-0 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Updating" : "Update Password"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link className="text-xs font-bold text-[#2563ff] hover:underline" href="/login">
          Back to sign in
        </Link>
      </div>
    </section>
  );
}
