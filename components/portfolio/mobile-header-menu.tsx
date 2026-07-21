import Link from "next/link";

type MobileHeaderMenuProps = {
  active?: string;
  items: ReadonlyArray<{
    href: string;
    id: string;
    label: string;
  }>;
};

const menuToggleId = "mobile-header-menu-toggle";

export function MobileHeaderMenu({ active, items }: MobileHeaderMenuProps) {
  return (
    <div className="flex items-center gap-2 md:hidden">
      {/* Hamburger trigger — buka menu navigasi */}
      <input className="peer sr-only" id={menuToggleId} type="checkbox" />
      <label
        aria-label="Buka menu"
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-3 py-2 text-[12px] font-bold text-white shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 sm:px-4 sm:text-[13px]"
        htmlFor={menuToggleId}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            strokeLinecap="round"
          />
        </svg>
      </label>

      {/* Mobile drawer */}
      <div className="pointer-events-none fixed inset-0 z-[70] h-[100dvh] min-h-[100dvh] bg-[color:var(--surface-overlay)] opacity-0 backdrop-blur-sm transition duration-200 peer-checked:pointer-events-auto peer-checked:opacity-100 md:hidden">
        <label
          aria-label="Tutup menu"
          className="absolute inset-0 cursor-default"
          htmlFor={menuToggleId}
        />
        <aside className="absolute right-0 top-0 flex h-[100dvh] min-h-[100dvh] w-[min(82vw,330px)] flex-col justify-between border-l border-[color:var(--border-strong)] bg-[color:var(--surface)] px-5 py-5 shadow-[-24px_0_70px_rgba(0,0,0,0.18)]">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-strong)] pb-5">
              <p className="text-[18px] font-black leading-none text-[color:var(--text)]">works</p>
              <label
                className="cursor-pointer rounded-full border border-[color:var(--border-solid)] px-3 py-1.5 text-[12px] font-black text-[color:var(--text)]/[0.64]"
                htmlFor={menuToggleId}
              >
                Close
              </label>
            </div>

            <nav className="mt-6 flex flex-col divide-y divide-[color:var(--border-strong)]">
              {items.map((item) => {
                const isActive = active === item.id;

                return (
                  <Link
                    className={`py-4 text-[26px] font-black leading-none transition ${
                      isActive ? "text-[#ff4f0a]" : "text-[color:var(--text)] hover:text-[#ff4f0a]"
                    }`}
                    href={item.href}
                    key={item.id}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="grid gap-3 border-t border-[color:var(--border-strong)] pt-5">
            <Link
              className={`text-[13px] font-black transition ${
                active === "login" ? "text-[#ff4f0a]" : "text-[color:var(--text)]/[0.58] hover:text-[color:var(--text)]"
              }`}
              href="/login"
            >
              Sign In
            </Link>

          </div>
        </aside>
      </div>
    </div>
  );
}