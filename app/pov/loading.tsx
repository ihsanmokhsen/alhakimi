export default function PovLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)]">
      {/* Header skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
        <div className="mt-5 h-16 w-80 animate-pulse rounded bg-black/8 sm:h-24 sm:w-[28rem]" />
        <div className="mt-8 h-5 w-full max-w-2xl animate-pulse rounded bg-black/6" />
      </section>

      {/* Video skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="w-full space-y-3" key={i}>
              <div
                className="w-full animate-pulse overflow-hidden rounded-[20px] border border-[color:var(--border-solid)] bg-black/[0.04]"
                style={{ aspectRatio: "9 / 16" }}
              />
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/8 px-1" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
