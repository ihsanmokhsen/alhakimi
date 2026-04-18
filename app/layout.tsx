import type { Metadata } from "next";

import "@/app/globals.css";
import { AccessibilityControls } from "@/components/portfolio/accessibility-controls";
import { EntrySplash } from "@/components/portfolio/entry-splash";

export const metadata: Metadata = {
  title: "@alhakimi",
  description: "Minimalist portfolio"
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
