import Link from "next/link";
import Image from "next/image";

import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { BottomNav } from "@/components/portfolio/bottom-nav";
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
          <GlassCard className="overflow-hidden p-5 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
              <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-[28px] border border-[color:var(--ui-border)] bg-[var(--ui-chip)] sm:w-52">
                <Image alt="@alhakimi" className="object-cover" fill priority sizes="208px" src="/foto.png" />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--ui-soft)]">About Me</p>
                  <h1 className="text-2xl font-semibold leading-tight text-[color:var(--ui-strong)] sm:text-4xl">
                    @alhakimi
                  </h1>
                  <p className="max-w-3xl text-sm leading-8 text-[color:var(--ui-muted)] sm:text-[15px]">
                    I focus on building web applications that feel clean, fast to use, and visually clear. This page
                    is a short space to introduce who I am, how I approach my work, and the main focus behind the
                    projects featured across this portfolio.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <GlassCard className="p-4">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[color:var(--ui-soft)]">Focus</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ui-muted)]">
                      Web applications, dashboards, and information systems.
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[color:var(--ui-soft)]">Approach</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ui-muted)]">
                      Minimal, structured, and easy to use.
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[color:var(--ui-soft)]">Role</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ui-muted)]">Programs, Data, and Evaluation.</p>
                  </GlassCard>
                </div>
              </div>
            </div>
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
      <BottomNav />
    </main>
  );
}
