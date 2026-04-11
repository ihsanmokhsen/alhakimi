import Link from "next/link";

import { JournalGrid } from "@/components/portfolio/journal-grid";
import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { BottomNav } from "@/components/portfolio/bottom-nav";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SiteHeader } from "@/components/portfolio/site-header";
import { getJournals } from "@/lib/data/journals";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const journals = await getJournals();

  return (
    <main className="relative isolate min-h-screen px-4 pt-3 pb-8 sm:px-6 sm:pt-4">
      <BackgroundLayer />

      <SiteHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <section className="min-h-[10vh] sm:min-h-[14vh]" />

        <JournalGrid journals={journals} />

        <SiteFooter />
      </div>

      <Link
        className="fixed bottom-3 right-3 z-40 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.28em] text-white/34 backdrop-blur-xl transition duration-300 hover:border-white/18 hover:text-accent sm:bottom-5 sm:right-5 sm:px-3 sm:py-2 sm:text-[10px]"
        href="/login"
      >
        Login
      </Link>
      <BottomNav />
    </main>
  );
}
