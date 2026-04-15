import Link from "next/link";

import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { BottomNav } from "@/components/portfolio/bottom-nav";
import { EmailButton } from "@/components/portfolio/email-button";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SiteHeader } from "@/components/portfolio/site-header";
import { GlassCard } from "@/components/ui/glass-card";

export default function AboutPage() {
  return (
    <main className="relative isolate min-h-screen px-4 pt-3 pb-8 sm:px-6 sm:pt-4">
      <BackgroundLayer />

      <SiteHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <section className="min-h-[10vh] sm:min-h-[14vh]" />

        <section className="pb-8">
          <GlassCard className="mx-auto max-w-4xl p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--ui-soft)]">About Me</p>
              <h1 className="text-2xl font-semibold leading-tight text-[color:var(--ui-strong)] sm:text-4xl">
                Muhammad Ihsanul Hakim Mokhsen
              </h1>
            </div>

            <p className="mt-6 whitespace-pre-line text-sm leading-8 text-[color:var(--ui-muted)] sm:text-[15px]">
              As a civil servant at the Regional Revenue and Asset Agency of East Nusa Tenggara Province, I actively
              develop simple web-based applications to support operational activities and improve workflow efficiency
              within the institution.
              {"\n\n"}I focus on building web applications that are clean, fast to use, and visually clear. This page
              provides a brief introduction, outlines my working approach, and highlights the main ideas behind the
              projects featured in this portfolio.
              {"\n\n"}Kupang, 2026
              {"\n"}Muhammad Ihsanul Hakim Mokhsen
            </p>
          </GlassCard>
        </section>

        <SiteFooter />
      </div>

      <Link
        className="fixed bottom-3 right-3 z-40 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.28em] text-white/34 backdrop-blur-xl transition duration-300 hover:border-white/18 hover:text-accent sm:bottom-5 sm:right-5 sm:px-3 sm:py-2 sm:text-[10px]"
        href="/login"
      >
        Login
      </Link>
      <EmailButton />
      <BottomNav />
    </main>
  );
}
