"use client";

import Link from "next/link";
import { useState } from "react";

import { ConsultationModal } from "@/components/portfolio/consultation-modal";
import { MobileHeaderMenu } from "@/components/portfolio/mobile-header-menu";
import { cn } from "@/lib/utils";

type WorksHeaderProps = {
  active?: "explore" | "stories" | "works" | "about" | "kopitrack" | "login" | "pov";
  overlay?: boolean;
};

const navItems = [
  { href: "/#explore", id: "explore", label: "Explore" },
  { href: "/journal", id: "stories", label: "Stories" },
  { href: "/#works", id: "works", label: "Works" },
  { href: "/pov", id: "pov", label: "POV" },
  { href: "/about", id: "about", label: "About" },
  { href: "/kopitrack/index.html", id: "kopitrack", label: "KopiTrack" }
] as const;

const footerLinks = [
  { href: "https://www.instagram.com/rex.orange777/", label: "Instagram" },
  { href: "https://www.linkedin.com/in/ihsanmokhsen/", label: "LinkedIn" },
  { href: "https://www.ihsanmokhsen.com/", label: "Website" },
  { href: "mailto:ihsanmokhsen17@gmail.com", label: "Email" }
] as const;

export function WorksHeader({ active, overlay = false }: WorksHeaderProps) {
  const [consultOpen, setConsultOpen] = useState(false);

  return (
    <header
      className={cn(
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        "z-50 border-b border-black/[0.06] transition-colors duration-300",
        overlay
          ? "bg-black/10 backdrop-blur-xl md:bg-black/5"
          : "bg-white/80 backdrop-blur-2xl"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          className={cn(
            "text-[18px] font-black leading-none sm:text-[20px] transition-colors",
            overlay ? "text-white" : "text-black"
          )}
          href="/"
        >
          works
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = active === item.id;

            return (
              <Link
                className={cn(
                  "text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 focus-visible:ring-offset-2",
                  overlay
                    ? isActive ? "text-white" : "text-white/70 hover:text-white"
                    : isActive ? "text-[#2563ff]" : "text-black/58 hover:text-black"
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className={cn(
              "hidden px-4 py-2 text-[13px] font-semibold transition sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50",
              overlay
                ? active === "login" ? "text-white" : "text-white/70 hover:text-white"
                : active === "login" ? "text-[#2563ff]" : "text-black/62 hover:text-black"
            )}
            href="/login"
          >
            Sign In
          </Link>
          <button
            className="hidden cursor-pointer rounded-full bg-[#2563ff] px-4 py-2 text-[13px] font-bold text-white shadow-[0_16px_38px_rgba(37,99,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0f4ff2] hover:shadow-[0_22px_48px_rgba(37,99,255,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 focus-visible:ring-offset-2 md:inline-flex lg:px-5"
            onClick={() => setConsultOpen(true)}
            type="button"
          >
            Buat Website
          </button>
          <MobileHeaderMenu active={active} items={navItems} onConsultClick={() => setConsultOpen(true)} />
        </div>
      </div>

      <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </header>
  );
}

export function WorksFooter() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#08080a] via-[#0f172a] to-[#08080a] bg-[length:200%_200%] px-4 py-14 text-center text-white sm:px-6 sm:py-20 lg:px-8" style={{ animation: "gradientShift 8s ease infinite" }}>
      {/* Background subtle glow orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-[#2563ff]/10 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-violet-600/8 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl border-y border-white/12 py-8 sm:py-12">
        <p className="text-[clamp(2.05rem,9vw,10.5rem)] font-black lowercase leading-[0.82] tracking-normal">
          <span className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">works.</span>
          <span className="block bg-gradient-to-r from-white/90 via-blue-300 to-white/90 bg-clip-text text-transparent">ihsanmokhsen</span>
          <span className="block text-white/40">.com</span>
        </p>
      </div>
      <div className="relative mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[12px] font-bold uppercase tracking-normal text-white/50 sm:mt-10 sm:gap-x-5 sm:text-[13px]">
        {footerLinks.map((item, index) => (
          <div className="flex items-center gap-4 sm:gap-5" key={item.href}>
            {index > 0 ? <span className="h-1 w-1 rounded-full bg-white/20" /> : null}
            <a
              className="transition-colors duration-300 hover:text-white"
              href={item.href}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              target={item.href.startsWith("http") ? "_blank" : undefined}
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>
    </footer>
  );
}

export { WorksHeader as MaknaHeader, WorksFooter as MaknaFooter };
