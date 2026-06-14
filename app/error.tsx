"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <div className="max-w-md text-center">
        <p className="text-[12px] font-black uppercase tracking-wider text-[#2563ff]">
          Error
        </p>
        <h1 className="mt-4 text-[48px] font-black leading-none text-black sm:text-[64px]">
          Something went wrong.
        </h1>
        <p className="mt-6 text-[15px] font-medium leading-7 text-black/56">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        {error.digest && (
          <p className="mt-3 text-[12px] font-mono text-black/30">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            className="inline-flex min-w-40 justify-center rounded-full bg-[#2563ff] px-6 py-3 text-[13px] font-black text-white shadow-[0_14px_34px_rgba(37,99,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0f4ff2]"
            onClick={() => reset()}
            type="button"
          >
            Try again
          </button>
          <Link
            className="inline-flex min-w-40 justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-[13px] font-black text-black transition hover:-translate-y-0.5 hover:border-black/18"
            href="/"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
