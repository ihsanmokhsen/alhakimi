"use client";

import dynamic from "next/dynamic";

const AccessibilityControlsInner = dynamic(
  () => import("@/components/portfolio/accessibility-controls").then(m => m.AccessibilityControls),
  { ssr: false }
);

export function AccessibilityControlsWrapper() {
  return <AccessibilityControlsInner />;
}
