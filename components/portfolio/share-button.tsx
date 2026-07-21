"use client";

import { useCallback, useState } from "react";

type ShareButtonProps = {
  title: string;
  url: string;
  variant?: "dark" | "light";
};

export function ShareButton({ title, url, variant = "dark" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    // Try native Web Share API first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — do nothing
    }
  }, [title, url]);

  const isDark = variant === "dark";

  return (
    <button
      aria-label={copied ? "Tautan disalin" : `Bagikan ${title}`}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-[12px] font-black uppercase tracking-normal transition ${
        isDark
          ? "border border-[color:var(--border-solid)] bg-[color:var(--surface)] text-[color:var(--text)] hover:-translate-y-0.5 hover:border-black/20"
          : "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] hover:-translate-y-0.5 hover:border-black/14"
      } ${copied ? "bg-[#ff4f0a] !text-white" : ""}`}
      onClick={handleShare}
      type="button"
    >
      {copied ? (
        <>
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Disalin
        </>
      ) : (
        <>
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
          </svg>
          Bagikan
        </>
      )}
    </button>
  );
}
