export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <section className="flex min-h-screen items-center justify-center bg-[#1a1a1e] px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-48 animate-pulse rounded-lg bg-white/10 sm:h-24 sm:w-72" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/8 sm:h-5 sm:w-96" />
          <div className="mt-4 flex gap-3">
            <div className="h-12 w-40 animate-pulse rounded bg-[#2563ff]/30" />
            <div className="h-12 w-40 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              className="h-[380px] animate-pulse rounded border border-black/[0.06] bg-[#f5f5f7] sm:h-[480px]"
              key={i}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
