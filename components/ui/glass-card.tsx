import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[color:var(--ui-border)] bg-[image:var(--ui-card)] shadow-glass backdrop-blur-2xl",
        className
      )}
      {...props}
    />
  );
}
