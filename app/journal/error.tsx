"use client";

import Link from "next/link";

export default function JournalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ecefed]">
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md text-center">
          <p className="text-[12px] font-black uppercase tracking-wider text-[#ff4f0a]">
            Stories error
          </p>
          <h1 className="mt-4 text-[36px] font-black leading-none text-black sm:text-[48px]">
            Couldn&apos;t load stories.
          </h1>
          <p className="mt-6 text-[15px] font-medium leading-7 text-black/56">
            Something went wrong while loading the journal. Please try again.
          </p>
          {error.digest && (
            <p className="mt-3 text-[12px] font-mono text-black/30">
              Reference: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              className="inline-flex min-w-40 justify-center rounded-full bg-[#ff4f0a] px-6 py-3 text-[13px] font-black text-white shadow-[0_14px_34px_rgba(255,79,10,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e54100]"
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
      </section>
    </main>
  );
}
