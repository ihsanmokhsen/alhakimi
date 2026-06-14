export default function AdminLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
        {/* Header */}
        <div className="grid gap-6 border-b border-black/10 pb-8 sm:pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:pb-12">
          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-black/10" />
            <div className="mt-3 h-14 w-full max-w-md animate-pulse rounded bg-black/8 sm:h-20" />
            <div className="mt-4 h-4 w-72 animate-pulse rounded bg-black/6" />
          </div>
          <div className="flex gap-3 lg:justify-end">
            <div className="h-24 w-32 animate-pulse rounded-[20px] border border-black/[0.06] bg-white" />
            <div className="h-24 w-32 animate-pulse rounded-[20px] border border-black/[0.06] bg-white" />
          </div>
        </div>

        {/* Project list skeleton */}
        <div className="space-y-4 pt-8 sm:pt-10">
          <div className="h-3 w-14 animate-pulse rounded bg-black/10" />
          <div className="h-10 w-56 animate-pulse rounded bg-black/8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              className="h-20 animate-pulse rounded border border-black/[0.06] bg-white"
              key={i}
            />
          ))}
        </div>

        {/* Journal skeleton */}
        <div className="space-y-4 border-t border-black/10 pt-8 sm:pt-10">
          <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
          <div className="h-10 w-40 animate-pulse rounded bg-black/8" />
          <div className="h-48 animate-pulse rounded border border-black/[0.06] bg-white" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              className="h-16 animate-pulse rounded border border-black/[0.06] bg-white"
              key={i}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
