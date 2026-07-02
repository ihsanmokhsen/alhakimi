import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "@/app/globals.css";
import { AccessibilityControlsWrapper } from "@/components/portfolio/accessibility-controls-wrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta"
});

const SITE_URL = "https://works.ihsanmokhsen.com";
const SITE_TITLE = "works";
const SITE_DESC = "A modern digital space for ideas, stories, products, creativity, and meaningful experiences.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
      <body className={jakarta.variable}>
        {children}
        <AccessibilityControlsWrapper />
      </body>
    </html>
  );
}
