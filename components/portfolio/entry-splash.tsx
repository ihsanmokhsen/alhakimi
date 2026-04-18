"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SPLASH_STORAGE_KEY = "works-entry-splash-seen";

export function EntrySplash() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const isPublicRoute = pathname !== "/login" && !pathname.startsWith("/admin");

    if (!isPublicRoute) {
      setIsVisible(false);
      setIsReady(false);
      setIsClosing(false);
      return;
    }

    const hasSeenSplash = window.sessionStorage.getItem(SPLASH_STORAGE_KEY) === "true";

    if (hasSeenSplash) {
      setIsVisible(false);
      setIsReady(false);
      setIsClosing(false);
      return;
    }

    setIsVisible(true);
    setIsClosing(false);

    const frame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  function handleEnter() {
    window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");
    setIsClosing(true);
    setIsReady(false);

    window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 900);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center overflow-hidden transition-opacity duration-[900ms] ${
        isReady && !isClosing ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[1200ms] ${
          isReady && !isClosing ? "scale-100 blur-sm" : "scale-110 blur-xl"
        }`}
        style={{ backgroundImage: "url('/wpp.jpg')" }}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.78),rgba(8,8,8,0.94))] transition-opacity duration-[1200ms] ${
          isReady && !isClosing ? "opacity-100" : "opacity-0"
        }`}
      />

      <button
        className="absolute inset-0 cursor-pointer"
        onClick={handleEnter}
        type="button"
      >
        <span className="sr-only">Enter Works</span>
      </button>

      <div
        className={`relative z-[1] flex flex-col items-center gap-5 px-6 text-center transition-all duration-[1200ms] ${
          isReady && !isClosing ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.985] opacity-0"
        }`}
      >
        <p className="text-[11px] uppercase tracking-[0.42em] text-white/46 sm:text-[12px]">Click to enter</p>
        <h1 className="text-5xl font-semibold tracking-[0.16em] text-white sm:text-7xl lg:text-8xl">Works</h1>
      </div>
    </div>
  );
}
