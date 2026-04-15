"use client";

import Image from "next/image";

export function EmailButton() {
  return (
    <a
      aria-label="Message me via email"
      className="fixed bottom-3 left-3 z-40 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-xl transition duration-300 hover:border-white/18 hover:text-white sm:bottom-5 sm:left-5 sm:px-3 sm:py-2 sm:text-[10px]"
      href="mailto:ihsanmokhsen17@gmail.com"
    >
      <span className="relative h-5 w-5 overflow-hidden rounded-full border border-white/12 sm:h-6 sm:w-6">
        <Image
          alt="Muhammad Ihsanul Hakim Mokhsen"
          className="object-cover"
          fill
          sizes="24px"
          src="/foto.png"
        />
      </span>
      <span>Message me via email</span>
    </a>
  );
}
