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
    <div className="md:hidden">
      <input className="peer sr-only" id={menuToggleId} type="checkbox" />
      <label
        aria-label="Buka menu"
        className="inline-flex cursor-pointer bg-black px-4 py-2 text-[13px] font-bold text-white shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
        htmlFor={menuToggleId}
      >
        Get Started
      </label>

      <div className="pointer-events-none fixed inset-0 z-[70] h-[100dvh] min-h-[100dvh] bg-black/[0.34] opacity-0 backdrop-blur-sm transition duration-200 peer-checked:pointer-events-auto peer-checked:opacity-100 md:hidden">
        <label
          aria-label="Tutup menu"
          className="absolute inset-0 cursor-default"
          htmlFor={menuToggleId}
        />
        <aside className="absolute right-0 top-0 flex h-[100dvh] min-h-[100dvh] w-[min(82vw,330px)] flex-col justify-between border-l border-black/[0.08] bg-white px-5 py-5 shadow-[-24px_0_70px_rgba(0,0,0,0.18)]">
          <div>
            <div className="flex items-center justify-between gap-4 border-b border-black/[0.08] pb-5">
              <p className="text-[18px] font-black leading-none text-black">makna.im</p>
              <label
                className="cursor-pointer border border-black/[0.10] px-3 py-1.5 text-[12px] font-black text-black/[0.64]"
                htmlFor={menuToggleId}
              >
                Close
              </label>
            </div>

            <nav className="mt-6 flex flex-col divide-y divide-black/[0.08]">
              {items.map((item) => {
                const isActive = active === item.id;

                return (
                  <Link
                    className={`py-4 text-[26px] font-black leading-none transition ${
                      isActive ? "text-[#2563ff]" : "text-black hover:text-[#2563ff]"
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

          <div className="grid gap-3 border-t border-black/[0.08] pt-5">
            <Link
              className={`text-[13px] font-black transition ${
                active === "login" ? "text-[#2563ff]" : "text-black/[0.58] hover:text-black"
              }`}
              href="/login"
            >
              Sign In
            </Link>
            <Link className="bg-black px-4 py-3 text-center text-[13px] font-black text-white" href="/#works">
              Go to Works
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
