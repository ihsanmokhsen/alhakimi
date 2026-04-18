"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const FONT_COLOR_KEY = "a11y-font-color";
const FONT_SIZE_KEY = "a11y-font-size";

type FontColor = "white" | "black";
type FontSize = "small" | "large";

function applyAccessibility(fontColor: FontColor, fontSize: FontSize) {
  document.documentElement.dataset.a11yFontColor = fontColor;
  document.documentElement.dataset.a11yFontSize = fontSize;
}

export function AccessibilityControls() {
  const pathname = usePathname();
  const [fontColor, setFontColor] = useState<FontColor>("white");
  const [fontSize, setFontSize] = useState<FontSize>("small");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedColor = (window.localStorage.getItem(FONT_COLOR_KEY) as FontColor | null) ?? "white";
    const storedSize = (window.localStorage.getItem(FONT_SIZE_KEY) as FontSize | null) ?? "small";

    setFontColor(storedColor);
    setFontSize(storedSize);
    applyAccessibility(storedColor, storedSize);
    setIsReady(true);
  }, []);

  function updateFontColor(value: FontColor) {
    setFontColor(value);
    window.localStorage.setItem(FONT_COLOR_KEY, value);
    applyAccessibility(value, fontSize);
  }

  function updateFontSize(value: FontSize) {
    setFontSize(value);
    window.localStorage.setItem(FONT_SIZE_KEY, value);
    applyAccessibility(fontColor, value);
  }

  if (!isReady || pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/72 backdrop-blur-xl sm:bottom-20">
      <div className="flex items-center gap-2">
        <span className="text-white/46">Font</span>
        <button
          className={`rounded-full px-2 py-1 transition ${fontColor === "white" ? "bg-white/16 text-white" : "text-white/52 hover:text-white"}`}
          onClick={() => updateFontColor("white")}
          type="button"
        >
          White
        </button>
        <button
          className={`rounded-full px-2 py-1 transition ${fontColor === "black" ? "bg-white/16 text-white" : "text-white/52 hover:text-white"}`}
          onClick={() => updateFontColor("black")}
          type="button"
        >
          Black
        </button>
      </div>

      <span className="h-4 w-px bg-white/12" />

      <div className="flex items-center gap-2">
        <span className="text-white/46">Size</span>
        <button
          className={`rounded-full px-2 py-1 transition ${fontSize === "small" ? "bg-white/16 text-white" : "text-white/52 hover:text-white"}`}
          onClick={() => updateFontSize("small")}
          type="button"
        >
          Small
        </button>
        <button
          className={`rounded-full px-2 py-1 transition ${fontSize === "large" ? "bg-white/16 text-white" : "text-white/52 hover:text-white"}`}
          onClick={() => updateFontSize("large")}
          type="button"
        >
          Large
        </button>
      </div>
    </div>
  );
}
