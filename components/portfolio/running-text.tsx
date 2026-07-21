type RunningTextProps = {
  items: { title: string }[];
};

export function RunningText({ items }: RunningTextProps) {
  if (items.length === 0) return null;

  const text = items.map((item) => item.title).join("          •          ");

  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 bg-gradient-to-r from-[#08080a] via-[#1a201e] to-[#08080a] py-4">
      {/* Subtle edge fade */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#08080a] to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-r from-transparent to-[#08080a]" />

      <div className="marquee-track flex whitespace-nowrap">
        <span className="marquee-content inline-flex shrink-0 items-center gap-8 text-[10px] font-medium uppercase tracking-[0.25em] text-white/45">
          {text}
        </span>
        <span className="marquee-content inline-flex shrink-0 items-center gap-8 text-[10px] font-medium uppercase tracking-[0.25em] text-white/45">
          {text}
        </span>
      </div>
    </div>
  );
}
