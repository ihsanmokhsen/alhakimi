import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { AccessibilityControlsWrapper } from "@/components/portfolio/accessibility-controls-wrapper";

const SITE_URL = "https://works.ihsanmokhsen.com";
const SITE_TITLE = "works";
const SITE_DESC = "A modern digital space for ideas, stories, products, creativity, and meaningful experiences.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_TITLE,
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0b"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://www.youtube.com" rel="preconnect" />
        <link href="https://i.ytimg.com" rel="preconnect" />
      </head>
      <body>
        {children}
        <AccessibilityControlsWrapper />
      </body>
    </html>
  );
}
