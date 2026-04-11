"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About Me" }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 sm:bottom-5 sm:gap-5">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            className={cn(
              "text-[9px] uppercase tracking-[0.24em] transition sm:text-[10px]",
              isActive ? "text-[color:var(--ui-strong)]" : "text-[color:var(--ui-soft)] hover:text-accent"
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
