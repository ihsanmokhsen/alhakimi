"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

import type { ProjectCard } from "@/lib/data/projects";

type WorksGalleryProps = {
  projects: ProjectCard[];
  onOpen: (project: ProjectCard) => void;
};

/** Jarak geser (px) sebelum seretan mouse dianggap drag, bukan klik. */
const DRAG_THRESHOLD = 6;

/**
 * Di desktop galeri "menempel" dan scroll vertikal menggeser kartu ke samping (seperti coreastudios.com).
 * Layar sentuh tetap memakai usap horizontal biasa.
 */
const PINNED_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

function usePinnedMode() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(PINNED_QUERY);
    const update = () => setPinned(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return pinned;
}

function formatWita(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Makassar"
  }).format(date);
}

function LiveClock() {
  // Dimulai null agar render server dan klien sama; jam baru muncul setelah mount.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatWita(new Date()));
    const timer = window.setInterval(() => setTime(formatWita(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tabular-nums text-[color:var(--text)]/48">
      <span>Kupang</span>
      <span className="min-w-[4.6rem]">{time ? `${time} WITA` : " "}</span>
      <span aria-hidden="true" className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4f0a]/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4f0a]" />
      </span>
    </span>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <path
        d={direction === "left" ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function WorksGallery({ projects, onOpen }: WorksGalleryProps) {
  const pinned = usePinnedMode();
  const pinRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScroll: 0
  });
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Panjang geser horizontal (px) = tinggi scroll tambahan saat galeri menempel.
  const [distance, setDistance] = useState(0);

  const syncScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setProgress(max > 0 ? rail.scrollLeft / max : 0);
    setCanPrev(rail.scrollLeft > 4);
    setCanNext(rail.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // Hasil pencarian berubah: kembali ke awal galeri.
    rail.scrollTo({ left: 0 });

    const measure = () => {
      setDistance(Math.max(rail.scrollWidth - rail.clientWidth, 0));
      syncScrollState();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [projects, pinned, syncScrollState]);

  // Mode menempel: posisi scroll halaman diterjemahkan menjadi geseran horizontal.
  useEffect(() => {
    const pin = pinRef.current;
    const rail = railRef.current;
    if (!pinned || !pin || !rail) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const travelled = Math.min(Math.max(-pin.getBoundingClientRect().top, 0), distance);
      rail.scrollLeft = travelled;
      syncScrollState();
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pinned, distance, syncScrollState]);

  function scrollByCard(direction: 1 | -1) {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>("[data-card]");
    if (!rail || !card) return;
    const step = direction * (card.offsetWidth + 16) * 2;
    if (pinned) {
      window.scrollBy({ top: step, behavior: "smooth" });
    } else {
      rail.scrollBy({ left: step, behavior: "smooth" });
    }
  }

  // Seret dengan mouse untuk menggeser galeri; sentuhan memakai scroll bawaan.
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (pinned || event.pointerType !== "mouse" || event.button !== 0 || !railRef.current) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: railRef.current.scrollLeft
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const rail = railRef.current;
    if (!state.active || !rail) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) > DRAG_THRESHOLD) {
      state.moved = true;
      setDragging(true);
      rail.setPointerCapture(event.pointerId);
    }
    if (state.moved) rail.scrollLeft = state.startScroll - delta;
  }

  function handlePointerUp() {
    drag.current.active = false;
    setDragging(false);
  }

  const count = String(projects.length).padStart(2, "0");

  return (
    <div
      className="works-rail-bleed"
      ref={pinRef}
      style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-[100svh] flex-col justify-center pt-20" : undefined}>
        <div
          aria-label="Galeri works"
          className={`works-rail flex gap-4 pb-6 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            pinned
              ? "overflow-x-hidden"
              : `overflow-x-auto ${dragging ? "cursor-grabbing select-none" : "snap-x snap-mandatory md:cursor-grab"}`
          }`}
          data-pinned={pinned || undefined}
          onClickCapture={(event) => {
            // Klik di akhir seretan tidak boleh membuka proyek.
            if (drag.current.moved) {
              event.preventDefault();
              event.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onScroll={syncScrollState}
          ref={railRef}
          role="region"
        >
          {projects.map((project, index) => {
            const imageSrc = `/api/project-logo/${project.id}?v=${new Date(project.updatedAt).getTime()}`;

            return (
              <button
                className="works-card group relative aspect-[3/4] w-[78vw] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-[color:var(--surface-muted)] text-left shadow-[0_18px_60px_rgba(18,24,22,0.10)] outline-none transition-[transform,box-shadow] duration-500 [animation-delay:var(--delay)] focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/60 focus-visible:ring-offset-2 sm:w-[44vw] lg:w-[29vw] [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:shadow-[0_30px_90px_rgba(18,24,22,0.18)]"
                data-card
                draggable={false}
                key={project.id}
                onClick={() => onOpen(project)}
                style={{
                  ["--delay" as string]: `${Math.min(index, 6) * 70}ms`
                }}
                type="button"
              >
                {/* Lapisan warna: gambar yang sama, diburamkan sebagai latar. */}
                <Image
                  alt=""
                  aria-hidden="true"
                  className="scale-[1.3] object-cover blur-[18px] saturate-[1.7] transition duration-700 [@media(hover:hover)]:group-hover:scale-[1.15] [@media(hover:hover)]:group-hover:blur-[12px]"
                  draggable={false}
                  fill
                  quality={40}
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 29vw"
                  src={imageSrc}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,248,247,0.04)_0%,rgba(247,248,247,0.22)_50%,rgba(247,248,247,0.92)_88%)]" />

                {/* Gambar proyek: tajam di layar sentuh; di desktop samar lalu tajam saat hover. */}
                <div className="absolute inset-x-[9%] top-[8%] h-[46%] transition duration-500 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:scale-[0.96] [@media(hover:hover)]:opacity-55 [@media(hover:hover)]:blur-[6px] [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:blur-0 [@media(hover:hover)]:group-focus-visible:opacity-100 [@media(hover:hover)]:group-focus-visible:blur-0">
                  <Image
                    alt={`${project.title} visual`}
                    className="object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                    draggable={false}
                    fill
                    quality={85}
                    sizes="(max-width: 640px) 64vw, (max-width: 1024px) 36vw, 24vw"
                    src={imageSrc}
                  />
                </div>

                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:p-6">
                  <h2 className="line-clamp-4 break-words font-[family-name:var(--font-display)] text-[clamp(1.6rem,2.6vw,2.4rem)] uppercase leading-[0.95] text-[#121413] transition-colors duration-300 group-hover:text-[#ff4f0a]">
                    {project.title}
                  </h2>
                  <div className="flex items-end justify-between gap-3 text-[11px] font-bold uppercase text-[#121413]/55">
                    <span className="truncate">{project.category}</span>
                    <span className="shrink-0 tabular-nums">{new Date(project.createdAt).getFullYear()}</span>
                  </div>
                </div>

                <span className="absolute right-4 top-4 font-[family-name:var(--font-display)] text-[12px] tabular-nums text-[#121413]/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <div className="works-rail-pad mt-2 flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <button
              aria-label="Geser ke kiri"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] transition hover:border-[#ff4f0a]/30 hover:text-[#ff4f0a] disabled:pointer-events-none disabled:opacity-30"
              disabled={!canPrev}
              onClick={() => scrollByCard(-1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              aria-label="Geser ke kanan"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] transition hover:border-[#ff4f0a]/30 hover:text-[#ff4f0a] disabled:pointer-events-none disabled:opacity-30"
              disabled={!canNext}
              onClick={() => scrollByCard(1)}
              type="button"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>

          <div
            aria-hidden="true"
            className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-[color:var(--text)]/10"
          >
            <div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[#ff4f0a] transition-transform duration-150"
              style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }}
            />
          </div>

          <span className="font-[family-name:var(--font-display)] text-[12px] tabular-nums text-[color:var(--text)]/48">
            {count} Works
          </span>
          <span className="hidden md:inline-flex">
            <LiveClock />
          </span>
        </div>
      </div>
    </div>
  );
}
