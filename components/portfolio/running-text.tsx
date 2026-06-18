type RunningTextProps = {
  items: { title: string }[];
};

export function RunningText({ items }: RunningTextProps) {
  if (items.length === 0) return null;

  const text = items.map((item) => item.title).join("          •          ");

  return (
    <div className="relative w-full overflow-hidden bg-[#08080a] py-3 rounded-none">
      <div className="marquee-track flex whitespace-nowrap">
        <span className="marquee-content shrink-0 text-[10px] font-light tracking-wide text-white/80">
          {text}
        </span>
        <span className="marquee-content shrink-0 text-[10px] font-light tracking-wide text-white/80">
          {text}
        </span>
      </div>
    </div>
  );
}
