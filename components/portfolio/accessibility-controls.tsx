"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type A11yState = {
  fontSize: "normal" | "large";
  contrast: "default" | "black";
  reduceMotion: boolean;
};

const STORAGE_KEY = "works-a11y";

const defaultState: A11yState = {
  fontSize: "normal",
  contrast: "default",
  reduceMotion: false
};

function readStored(): A11yState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function applyToDOM(state: A11yState) {
  const root = document.documentElement;

  if (state.fontSize === "large") {
    root.setAttribute("data-a11y-font-size", "large");
  } else {
    root.removeAttribute("data-a11y-font-size");
  }

  if (state.contrast === "black") {
    root.setAttribute("data-a11y-font-color", "black");
  } else {
    root.removeAttribute("data-a11y-font-color");
  }

  if (state.reduceMotion) {
    root.setAttribute("data-a11y-reduce-motion", "true");
  } else {
    root.removeAttribute("data-a11y-reduce-motion");
  }
}

export function AccessibilityControls() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(defaultState);
  const panelRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = readStored();
    setState(stored);
    applyToDOM(stored);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const update = useCallback((patch: Partial<A11yState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applyToDOM(next);
      return next;
    });
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-50" ref={panelRef}>
      {/* Toggle Button */}
      <button
        aria-expanded={open}
        aria-label="Accessibility settings"
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.24)] ${
          open
            ? "bg-[#2563ff] text-white ring-4 ring-[#2563ff]/20"
            : "bg-black text-white ring-1 ring-white/10"
        }`}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6.5 6h-13a1 1 0 0 0 0 2h3.38l.62 4.4 1.88 6.6a1 1 0 0 0 1.92-.52L12 15.6l-1.3 4.88a1 1 0 0 0 1.92.52l1.88-6.6.62-4.4H18.5a1 1 0 0 0 0-2Z" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-16 left-0 w-72 overflow-hidden rounded-[20px] border border-black/[0.08] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <div className="border-b border-black/[0.06] bg-[#2563ff] px-5 py-3.5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              Accessibility
            </p>
          </div>

          <div className="space-y-1 p-3">
            {/* Font Size */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-black/[0.03]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04] text-[16px] font-black text-black/50">A</span>
                <span className="text-[13px] font-bold text-black/80">Larger text</span>
              </div>
              <ToggleSwitch
                checked={state.fontSize === "large"}
                onChange={(on) => update({ fontSize: on ? "large" : "normal" })}
              />
            </label>

            {/* High Contrast */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-black/[0.03]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04]">
                  <svg className="h-4 w-4 text-black/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 0 20V2Z" fill="currentColor" />
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-black/80">High contrast</span>
              </div>
              <ToggleSwitch
                checked={state.contrast === "black"}
                onChange={(on) => update({ contrast: on ? "black" : "default" })}
              />
            </label>

            {/* Reduced Motion */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-black/[0.03]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04]">
                  <svg className="h-4 w-4 text-black/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M5 3l14 9-14 9V3Z" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-black/80">Reduce motion</span>
              </div>
              <ToggleSwitch
                checked={state.reduceMotion}
                onChange={(on) => update({ reduceMotion: on })}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Internal toggle switch ---- */

function ToggleSwitch({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      className={`relative h-6 w-10 rounded-full transition-colors ${
        checked ? "bg-[#2563ff]" : "bg-black/15"
      }`}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      role="switch"
      type="button"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
