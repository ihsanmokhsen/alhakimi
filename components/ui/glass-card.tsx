import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = ComponentProps<"div"> & {
  hoverable?: boolean;
};

export function GlassCard({ className, hoverable, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--ui-border)] bg-[image:var(--ui-card)] shadow-glass backdrop-blur-2xl",
        hoverable
          ? "transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_32px_100px_rgba(18,22,34,0.16),0_0_40px_-4px_rgba(255,79,10,0.1)] hover:border-[#ff4f0a]/20"
          : null,
        className
      )}
      {...props}
    />
  );
}
