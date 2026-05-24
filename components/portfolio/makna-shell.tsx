import Link from "next/link";

import { MobileHeaderMenu } from "@/components/portfolio/mobile-header-menu";

type MaknaHeaderProps = {
  active?: "explore" | "stories" | "works" | "about" | "kopitrack" | "login";
};

const navItems = [
  { href: "/#explore", id: "explore", label: "Explore" },
  { href: "/journal", id: "stories", label: "Stories" },
  { href: "/#works", id: "works", label: "Works" },
  { href: "/about", id: "about", label: "About" },
  { href: "/kopitrack/index.html", id: "kopitrack", label: "KopiTrack" }
] as const;

const footerLinks = [
  { href: "https://www.instagram.com/rex.orange777/", label: "Instagram" },
  { href: "https://www.linkedin.com/in/ihsanmokhsen/", label: "LinkedIn" },
  { href: "https://www.ihsanmokhsen.com/", label: "Website" },
  { href: "mailto:ihsanmokhsen17@gmail.com", label: "Email" }
] as const;

export function MaknaHeader({ active }: MaknaHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f5f5f7] md:bg-[#f5f5f7]/75 md:backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link className="text-[18px] font-black leading-none text-black sm:text-[20px]" href="/">
          makna.im
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = active === item.id;

            return (
              <Link
                className={`text-[13px] font-medium transition ${
                  isActive ? "text-[#2563ff]" : "text-black/58 hover:text-black"
                }`}
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
            className={`hidden rounded-full px-4 py-2 text-[13px] font-semibold transition sm:inline-flex ${
              active === "login" ? "text-[#2563ff]" : "text-black/62 hover:text-black"
            }`}
            href="/login"
          >
            Sign In
          </Link>
          <Link
            className="hidden rounded-full bg-black px-4 py-2 text-[13px] font-bold text-white shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] md:inline-flex lg:px-5"
            href="/#works"
          >
            Get Started
          </Link>
          <MobileHeaderMenu active={active} items={navItems} />
        </div>
      </div>
    </header>
  );
}

export function MaknaFooter() {
  return (
    <footer className="overflow-hidden bg-black px-4 py-14 text-center text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl border-y border-white/18 py-8 sm:py-12">
        <p className="text-[clamp(2.05rem,9vw,10.5rem)] font-black lowercase leading-[0.82] tracking-normal">
          <span className="block">works.</span>
          <span className="block">ihsanmokhsen</span>
          <span className="block">.com</span>
        </p>
      </div>
      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[12px] font-bold uppercase tracking-normal text-white/58 sm:mt-10 sm:gap-x-5 sm:text-[13px]">
        {footerLinks.map((item, index) => (
          <div className="flex items-center gap-4 sm:gap-5" key={item.href}>
            {index > 0 ? <span className="h-1 w-1 rounded-full bg-white/24" /> : null}
            <a
              className="transition hover:text-white"
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
