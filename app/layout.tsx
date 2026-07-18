import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Plus_Jakarta_Sans } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AccessibilityControlsWrapper } from "@/components/portfolio/accessibility-controls-wrapper";
import { ChatWidgetWrapper } from "@/components/portfolio/chat-widget-wrapper";
import { StructuredData } from "@/components/seo/structured-data";
import {
  PERSON_JSON_LD,
  PERSON_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAVIGATION_JSON_LD,
  SITE_URL,
  WEBSITE_JSON_LD
} from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta"
});

const configuredGoogleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const googleAnalyticsId =
  configuredGoogleAnalyticsId && /^G-[A-Z0-9]+$/.test(configuredGoogleAnalyticsId)
    ? configuredGoogleAnalyticsId
    : null;

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PERSON_NAME} | Portfolio, Riset & Karya Digital`,
    template: `%s | ${PERSON_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    PERSON_NAME,
    "Ihsan Mokhsen",
    "alhakimi",
    "Digital Forensics",
    "Information Security",
    "Cybersecurity Awareness",
    "HAIS-Q",
    "Pranata Komputer",
    "Portfolio Web Developer Indonesia"
  ],
  authors: [{ name: PERSON_NAME, url: "https://www.ihsanmokhsen.com/" }],
  creator: PERSON_NAME,
  publisher: PERSON_NAME,
  category: "technology",
  verification: {
    google: "hEhZ1VhICAwe7oImt0vDWTCc3r8IChSEc04EZtKrRd8"
  },
  alternates: {
    canonical: "/",
    languages: { "id-ID": "/" }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    title: `${PERSON_NAME} | Portfolio, Riset & Karya Digital`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [{ url: "/hero.jpg", width: 1200, height: 801, alt: `Portfolio ${PERSON_NAME}` }]
  },
  twitter: {
    card: "summary_large_image",
    title: `${PERSON_NAME} | Portfolio, Riset & Karya Digital`,
    description: SITE_DESCRIPTION,
    images: ["/hero.jpg"]
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
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [PERSON_JSON_LD, WEBSITE_JSON_LD, SITE_NAVIGATION_JSON_LD]
          }}
        />
        <ThemeProvider>
          {children}
          <AccessibilityControlsWrapper />
          <ChatWidgetWrapper />
        </ThemeProvider>
      </body>
      {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
    </html>
  );
}
