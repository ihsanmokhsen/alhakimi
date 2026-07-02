"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme/theme-provider";

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
  const { theme, toggle: toggleTheme } = useTheme();

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
      <button
        aria-expanded={open}
        aria-label="Accessibility settings"
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-glass backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] ${
          open
            ? "bg-accent text-white ring-4 ring-accent/30"
            : "bg-[color:var(--text-80)] text-white/90"
        }`}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          <circle cx="12" cy="5.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-16 left-0 w-72 overflow-hidden rounded-[20px] border border-[color:var(--ui-border)] bg-[color:var(--surface)]/95 shadow-glass backdrop-blur-2xl">
          <div className="border-b border-[color:var(--ui-border)] bg-accent px-5 py-3.5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              Aksesibilitas
            </p>
          </div>

          <div className="space-y-1 p-3">
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[color:var(--bg-card-hover)]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--bg-chip)]">
                  <svg className="h-4 w-4 text-[color:var(--text-50)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {theme === "dark" ? (
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02-.7l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-[color:var(--text-80)]">
                  {theme === "dark" ? "Mode terang" : "Mode gelap"}
                </span>
              </div>
              <ToggleSwitch
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[color:var(--bg-card-hover)]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--bg-chip)] text-[16px] font-black text-[color:var(--text-50)]">A</span>
                <span className="text-[13px] font-bold text-[color:var(--text-80)]">Teks lebih besar</span>
              </div>
              <ToggleSwitch
                checked={state.fontSize === "large"}
                onChange={(on) => update({ fontSize: on ? "large" : "normal" })}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[color:var(--bg-card-hover)]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--bg-chip)]">
                  <svg className="h-4 w-4 text-[color:var(--text-50)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 0 20V2Z" fill="currentColor" />
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-[color:var(--text-80)]">Kontras tinggi</span>
              </div>
              <ToggleSwitch
                checked={state.contrast === "black"}
                onChange={(on) => update({ contrast: on ? "black" : "default" })}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition hover:bg-[color:var(--bg-card-hover)]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--bg-chip)]">
                  <svg className="h-4 w-4 text-[color:var(--text-50)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M5 3l14 9-14 9V3Z" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-[color:var(--text-80)]">Kurangi gerak</span>
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
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
