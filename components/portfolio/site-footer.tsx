import { cn } from "@/lib/utils";

type SiteFooterProps = {
  compact?: boolean;
  light?: boolean;
};

export function SiteFooter({ compact = false, light = false }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        light
          ? "text-center text-[7px] uppercase tracking-[0.22em] text-[color:var(--public-text-faint)] sm:text-[8px]"
          : "text-center text-[7px] uppercase tracking-[0.22em] text-[color:var(--ui-soft)] sm:text-[8px]",
        compact ? "pb-12 pt-4" : "pb-10 pt-20"
      )}
    >
      Programs, Data, and Evaluation
    </footer>
  );
}
