"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AccessibilityControlsInner = dynamic(
  () => import("@/components/portfolio/accessibility-controls").then(m => m.AccessibilityControls),
  { ssr: false }
);

export function AccessibilityControlsWrapper() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }

  return <AccessibilityControlsInner />;
}
