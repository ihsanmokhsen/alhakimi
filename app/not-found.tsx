import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--surface-muted)] px-4">
      <div className="max-w-md text-center">
        <p className="text-[12px] font-black uppercase tracking-wider text-[#ff4f0a]">
          404
        </p>
        <h1 className="mt-4 text-[64px] font-black leading-none text-[color:var(--text)] sm:text-[96px]">
          Not found.
        </h1>
        <p className="mt-6 text-[15px] font-medium leading-7 text-[color:var(--text)]/56">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-w-40 justify-center rounded-full bg-[#ff4f0a] px-6 py-3 text-[13px] font-black text-white shadow-[0_14px_34px_rgba(255,79,10,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e54100]"
            href="/"
          >
            Go home
          </Link>
          <Link
            className="inline-flex min-w-40 justify-center rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface)] px-6 py-3 text-[13px] font-black text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-black/18"
            href="/journal"
          >
            Read stories
          </Link>
        </div>
      </div>
    </main>
  );
}
