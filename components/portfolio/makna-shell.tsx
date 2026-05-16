import Link from "next/link";

type MaknaHeaderProps = {
  active?: "explore" | "stories" | "works" | "about" | "login";
};

const navItems = [
  { href: "/#explore", id: "explore", label: "Explore" },
  { href: "/journal", id: "stories", label: "Stories" },
  { href: "/#works", id: "works", label: "Works" },
  { href: "/about", id: "about", label: "About" }
] as const;

export function MaknaHeader({ active }: MaknaHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f5f5f7]/75 backdrop-blur-2xl">
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
            className="inline-flex rounded-full bg-black px-4 py-2 text-[13px] font-bold text-white shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2563ff] sm:px-5"
            href="/#works"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MaknaFooter() {
  return (
    <footer className="border-t border-black/[0.06] px-4 py-10 text-center text-[12px] font-semibold text-black/40 sm:px-6">
      makna.im - ideas, stories, products, creativity, and meaningful experiences.
    </footer>
  );
}
