export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[color:var(--surface)]">
      {/* Hero skeleton */}
      <section className="flex min-h-screen items-center justify-center bg-[#1a1a1e] px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-48 animate-pulse rounded-lg bg-[color:var(--surface)]/10 sm:h-24 sm:w-72" />
          <div className="h-4 w-72 animate-pulse rounded bg-[color:var(--surface)]/8 sm:h-5 sm:w-96" />
          <div className="mt-4 flex gap-3">
            <div className="h-12 w-40 animate-pulse rounded bg-[#2563ff]/30" />
            <div className="h-12 w-40 animate-pulse rounded bg-[color:var(--surface)]/10" />
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="bg-[color:var(--surface)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              className="h-[380px] animate-pulse rounded border border-[color:var(--border)] bg-[color:var(--surface-muted)] sm:h-[480px]"
              key={i}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
