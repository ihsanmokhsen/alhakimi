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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="M12 7v5m0 0l-4 6m4-6l4 6M6 10h12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-14 left-0 w-64 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
          <p className="mb-4 text-[11px] font-black uppercase tracking-wider text-black/40">
            Accessibility
          </p>

          <div className="space-y-3">
            {/* Font Size */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
              <span className="text-[13px] font-semibold text-black/70">Larger text</span>
              <ToggleSwitch
                checked={state.fontSize === "large"}
                onChange={(on) => update({ fontSize: on ? "large" : "normal" })}
              />
            </label>

            {/* High Contrast */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
              <span className="text-[13px] font-semibold text-black/70">High contrast</span>
              <ToggleSwitch
                checked={state.contrast === "black"}
                onChange={(on) => update({ contrast: on ? "black" : "default" })}
              />
            </label>

            {/* Reduced Motion */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
              <span className="text-[13px] font-semibold text-black/70">Reduce motion</span>
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
