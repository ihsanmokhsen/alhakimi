export default function JournalDetailLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ecefed]">
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Date */}
        <div className="h-3 w-24 animate-pulse rounded bg-black/10" />

        {/* Title */}
        <div className="mt-6 h-12 w-full animate-pulse rounded bg-black/8 sm:h-16" />
        <div className="mt-3 h-12 w-2/3 animate-pulse rounded bg-black/8 sm:h-16" />

        {/* Photo placeholder */}
        <div className="mt-10 h-64 w-full animate-pulse rounded bg-[#e1e5e3] sm:h-96" />

        {/* Content lines */}
        <div className="mt-10 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              className="h-4 animate-pulse rounded bg-black/5"
              key={i}
              style={{ width: `${75 + Math.random() * 25}%` }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
