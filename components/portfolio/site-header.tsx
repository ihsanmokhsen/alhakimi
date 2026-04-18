import Image from "next/image";

import { HeaderClock } from "@/components/portfolio/header-clock";
import { GlassCard } from "@/components/ui/glass-card";

type SiteHeaderProps = {
  light?: boolean;
};

export function SiteHeader({ light = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-3 z-30 sm:top-4">
      <GlassCard className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex min-w-0 items-start gap-4 lg:justify-self-start">
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
              <p className={light ? "text-[8px] uppercase tracking-[0.24em] text-[color:var(--public-text-soft)] sm:text-[9px]" : "text-[8px] uppercase tracking-[0.24em] text-[color:var(--ui-soft)] sm:text-[9px]"}>
                Programs, Data, and Evaluation
              </p>
              <p className={light ? "mt-1 truncate text-[9px] font-semibold tracking-[0.06em] text-[color:var(--public-text-strong)] sm:mt-1.5 sm:text-[11px]" : "mt-1 truncate text-[9px] font-semibold tracking-[0.06em] text-[color:var(--ui-strong)] sm:mt-1.5 sm:text-[11px]"}>
                @alhakimi
              </p>
            </div>
          </div>

          <div className="justify-self-end pt-4 lg:pt-0">
            <HeaderClock light={light} />
          </div>
        </div>
      </GlassCard>
    </header>
  );
}
