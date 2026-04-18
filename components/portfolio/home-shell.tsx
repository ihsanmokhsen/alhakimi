import type { Project } from "@prisma/client";
import Link from "next/link";

import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { BottomNav } from "@/components/portfolio/bottom-nav";
import { EmailButton } from "@/components/portfolio/email-button";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SiteHeader } from "@/components/portfolio/site-header";
import { cn } from "@/lib/utils";

type HomeShellProps = {
  projects: Project[];
};

export function HomeShell({ projects }: HomeShellProps) {
  const isCompact = projects.length <= 2;

  return (
    <main
      className={cn(
        "relative isolate px-4 pt-3 sm:px-6 sm:pt-4",
        isCompact ? "flex min-h-screen flex-col overflow-hidden pb-4 sm:pb-5" : "pb-8"
      )}
    >
      <BackgroundLayer />

      <SiteHeader light />

      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col",
          isCompact ? "justify-between" : ""
        )}
      >
        <section className={cn(isCompact ? "min-h-[3vh] sm:min-h-[5vh]" : "min-h-[10vh] sm:min-h-[14vh]")} />

        <section className={cn(isCompact ? "pb-3" : "pb-8")}>
          <div className="pb-6 text-center sm:pb-8">
            <h1 className="text-4xl font-semibold tracking-[0.08em] text-white sm:text-6xl lg:text-7xl">Works</h1>
          </div>

          <PortfolioGrid compact={isCompact} projects={projects} />
        </section>

        <SiteFooter compact={isCompact} light />
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
