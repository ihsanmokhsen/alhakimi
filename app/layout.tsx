import type { Metadata } from "next";

import "@/app/globals.css";

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
      <body>{children}</body>
    </html>
  );
}
