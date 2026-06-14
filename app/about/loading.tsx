export default function AboutLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7]">
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-14 sm:px-6 sm:pt-24 lg:px-8">
        {/* Header */}
        <div className="border-b border-black/10 pb-12 sm:pb-16 lg:pb-20">
          <div className="h-3 w-14 animate-pulse rounded bg-black/10" />
          <div className="mt-5 h-16 w-full max-w-4xl animate-pulse rounded bg-black/8 sm:h-28" />
          <div className="mt-8 h-6 w-full max-w-3xl animate-pulse rounded bg-black/6" />
        </div>

        {/* Sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="grid gap-8 border-b border-black/10 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14" key={i}>
            <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
            <div className="space-y-4">
              <div className="h-10 w-full max-w-lg animate-pulse rounded bg-black/6" />
              <div className="h-4 w-full animate-pulse rounded bg-black/5" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-black/5" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
