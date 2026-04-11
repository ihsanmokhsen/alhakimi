import Image from "next/image";

import { HeaderClock } from "@/components/portfolio/header-clock";
import { GlassCard } from "@/components/ui/glass-card";

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-30 sm:top-4">
      <GlassCard className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-[color:var(--ui-border)] bg-[var(--ui-chip)] sm:h-12 sm:w-12">
            <Image
              alt="@alhakimi"
              className="object-cover"
              fill
              priority
              sizes="48px"
              src="/foto.png"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)] sm:text-[9px]">
              Programs, Data, and Evaluation
            </p>
            <p className="mt-1 truncate text-[9px] font-semibold tracking-[0.06em] text-[color:var(--ui-strong)] sm:mt-1.5 sm:text-[11px]">
              @alhakimi
            </p>
          </div>
        </div>
        <HeaderClock />
      </GlassCard>
    </header>
  );
}
