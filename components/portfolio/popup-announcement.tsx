"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "welcome-popup-dismissed";
const DISMISS_VALUE = "1";

type AnnouncementState =
  | { status: "loading" }
  | { status: "hidden" }
  | { status: "visible"; imageUrl: string };

export function PopupAnnouncement() {
  const [state, setState] = useState<AnnouncementState>({ status: "loading" });
  const [ready, setReady] = useState(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, DISMISS_VALUE);
    } catch {
      /* noop */
    }
    setState({ status: "hidden" });
  }, []);

  useEffect(() => {
    /* Cek localStorage dulu — kalau sudah pernah dismiss, jangan munculkan */
    try {
      if (localStorage.getItem(STORAGE_KEY) === DISMISS_VALUE) {
        setState({ status: "hidden" });
        return;
      }
    } catch {
      /* localStorage unavailable — tetap lanjut */
    }

    const controller = new AbortController();

    fetch("/api/welcome-image", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) return { ok: false } as const;
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.startsWith("application/json")) {
          return res.json().then((json: { exists: boolean }) => {
            if (!json.exists) return { ok: false } as const;
            return { ok: true as const, imageUrl: res.url };
          });
        }
        return { ok: true as const, imageUrl: res.url };
      })
      .then((result) => {
        if (result.ok && result.imageUrl) {
          setState({ status: "visible", imageUrl: result.imageUrl });
        } else {
          setState({ status: "hidden" });
        }
      })
      .catch(() => {
        setState({ status: "hidden" });
      });

    return () => controller.abort();
  }, []);

  const overlayReady = useCallback(() => setReady(true), []);

  /* Jangan render apa-apa saat loading atau hidden */
  if (state.status !== "visible") return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-500 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        onTransitionEnd={overlayReady}
      />
      <button
        aria-label="Tutup popup"
        className="fixed inset-0 cursor-default"
        onClick={dismiss}
        type="button"
      />

      {/* Popup card — max width terbatas agar tidak terlalu besar */}
      <section
        className={`relative z-10 w-full max-w-[min(500px,90vw)] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_140px_rgba(10,12,20,0.38)] transition-all duration-500 ${
          ready
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-10 scale-[0.97] opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          aria-label="Tutup"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          onClick={dismiss}
          type="button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Image — ukuran dibatasi untuk desktop & HP */}
        <div className="flex items-center justify-center bg-[#f5f5f7] p-4 sm:p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Welcome"
            className="max-h-[min(60vh,400px)] w-auto max-w-full rounded-[16px] object-contain"
            src={state.imageUrl}
          />
        </div>

        {/* Optional footer hint */}
        <div className="border-t border-black/[0.06] px-4 py-3 text-center">
          <p className="text-[11px] font-medium text-black/[0.38]">
            Popup ini hanya muncul sekali. Klik ✕ untuk menutup.
          </p>
        </div>
      </section>
    </div>
  );
}