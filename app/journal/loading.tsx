export default function JournalLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7]">
      {/* Header skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
        <div className="mt-5 h-16 w-80 animate-pulse rounded bg-black/8 sm:h-24 sm:w-[28rem]" />
        <div className="mt-8 h-5 w-full max-w-2xl animate-pulse rounded bg-black/6" />
      </section>

      {/* Grid skeleton */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              className="overflow-hidden rounded border border-black/[0.06] bg-white"
              key={i}
            >
              <div className="h-56 animate-pulse bg-[#ebecef]" />
              <div className="space-y-3 p-5 sm:p-6">
                <div className="h-3 w-20 animate-pulse rounded bg-black/8" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-black/6" />
                <div className="h-4 w-full animate-pulse rounded bg-black/5" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-black/5" />
                <div className="mt-6 h-9 w-28 animate-pulse rounded bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
