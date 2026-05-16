import type { Metadata } from "next";

import "@/app/globals.css";
import { AccessibilityControls } from "@/components/portfolio/accessibility-controls";
import { EntrySplash } from "@/components/portfolio/entry-splash";

export const metadata: Metadata = {
  title: "makna.im",
  description: "A modern digital space for ideas, stories, products, creativity, and meaningful experiences."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
        <AccessibilityControls />
        <EntrySplash />
      </body>
    </html>
  );
}
