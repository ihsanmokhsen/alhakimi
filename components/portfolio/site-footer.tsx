import { cn } from "@/lib/utils";

type SiteFooterProps = {
  compact?: boolean;
};

export function SiteFooter({ compact = false }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "text-center text-[7px] uppercase tracking-[0.22em] text-[color:var(--ui-soft)] sm:text-[8px]",
        compact ? "pb-12 pt-4" : "pb-10 pt-20"
      )}
    >
      Programs, Data, and Evaluation
    </footer>
  );
}
