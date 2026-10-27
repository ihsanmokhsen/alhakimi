"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import type { ProjectCard } from "@/lib/data/projects";

type WorksGalleryProps = {
  projects: ProjectCard[];
  onOpen: (project: ProjectCard) => void;
};

/** Jarak geser (px) sebelum seretan dianggap drag, bukan klik. */
const DRAG_THRESHOLD = 6;
/** Jarak seret (px) yang cukup untuk melempar kartu dan lanjut ke kartu berikutnya. */
const SWIPE_THRESHOLD = 90;
/** Durasi kartu terlempar keluar sebelum tumpukan berganti (ms). */
const FLY_DURATION = 320;
/** Jumlah kartu yang tampak di belakang kartu teratas. */
const STACK_DEPTH = 3;

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
      <span className="min-w-[4.6rem]">{time ? `${time} WITA` : " "}</span>
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

function OpenIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
      <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

/** Posisi kartu ke-`depth` di belakang: bergeser ke kiri-atas dan sedikit berputar, seperti kipas. */
function stackTransform(depth: number) {
  return `translate(${-depth * 22}px, ${-depth * 16}px) rotate(${-depth * 5}deg) scale(${1 - depth * 0.05})`;
}

/**
 * Galeri works berupa tumpukan kartu gelap: seret/usap kartu teratas ke samping,
 * pakai tombol panah, atau tombol keyboard ← → untuk berpindah karya.
 */
export function WorksGallery({ projects, onOpen }: WorksGalleryProps) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  // Arah kartu yang sedang dilempar keluar; null saat tidak ada animasi lempar.
  const [flying, setFlying] = useState<1 | -1 | null>(null);
  const drag = useRef({ active: false, moved: false, startX: 0 });
  const flyTimer = useRef<number>(0);

  const total = projects.length;

  useEffect(() => {
    // Hasil pencarian berubah: kembali ke kartu pertama.
    setIndex(0);
    setDragX(0);
    setFlying(null);
  }, [projects]);

  useEffect(() => () => window.clearTimeout(flyTimer.current), []);

  function go(direction: 1 | -1) {
    if (total < 2 || flying) return;
    setFlying(direction);
    flyTimer.current = window.setTimeout(() => {
      setIndex((current) => (current + direction + total) % total);
      setFlying(null);
      setDragX(0);
    }, FLY_DURATION);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (flying || (event.pointerType === "mouse" && event.button !== 0)) return;
    drag.current = { active: true, moved: false, startX: event.clientX };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state.active) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) > DRAG_THRESHOLD) {
      state.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (state.moved) setDragX(delta);
  }

  function handlePointerUp() {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD && total > 1) {
      // Usap ke kiri = kartu berikutnya, ke kanan = sebelumnya.
      go(dragX < 0 ? 1 : -1);
    } else {
      setDragX(0);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  }

  const visible = Array.from({ length: Math.min(STACK_DEPTH + 1, total) }, (_, depth) => ({
    depth,
    project: projects[(index + depth) % total]
  }));
  const current = projects[index];

  return (
    <div className="works-deck">
      <div
        aria-label="Galeri works"
        aria-roledescription="carousel"
        className={`relative mx-auto flex h-[min(78svh,640px)] min-h-[520px] items-center justify-center touch-pan-y select-none outline-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onClickCapture={(event) => {
          // Klik di akhir seretan tidak boleh membuka proyek.
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="region"
        tabIndex={0}
      >
        {/* Cahaya lembut di belakang tumpukan, seperti panggung. */}
        <div aria-hidden="true" className="works-deck-glow pointer-events-none absolute inset-0" />

        {visible
          .slice()
          .reverse()
          .map(({ depth, project }) => {
            const isTop = depth === 0;
            const imageSrc = `/api/project-logo/${project.id}?v=${new Date(project.updatedAt).getTime()}`;
            const number = String(((index + depth) % total) + 1).padStart(2, "0");

            // Saat kartu teratas dilempar, kartu di belakangnya ikut maju satu tingkat.
            const effectiveDepth = flying && !isTop ? depth - 1 : depth;
            let transform = stackTransform(effectiveDepth);
            if (isTop) {
              const x = flying ? flying * -640 : dragX;
              transform = `translate(${x}px, ${Math.abs(x) * 0.06}px) rotate(${x * 0.05}deg)`;
            }

            return (
              <article
                aria-hidden={!isTop}
                className="works-deck-card absolute flex aspect-[3/4.15] w-[min(80vw,340px)] flex-col rounded-[30px] bg-[#161718] p-3 text-white shadow-[0_40px_90px_-20px_rgba(10,12,14,0.55)] ring-1 ring-white/[0.06]"
                key={`${project.id}-${(index + depth) % total}`}
                style={{
                  transform,
                  zIndex: STACK_DEPTH + 1 - depth,
                  opacity: isTop && flying ? 0 : depth > STACK_DEPTH - 1 && !flying ? 0 : 1 - effectiveDepth * 0.18,
                  filter: effectiveDepth > 0 ? `brightness(${1 - effectiveDepth * 0.14})` : undefined,
                  transition: dragging && isTop ? "none" : undefined
                }}
              >
                <div className="flex items-center justify-between px-1.5 pt-0.5">
                  <span className="font-[family-name:var(--font-display)] text-[12px] tabular-nums text-white/45">
                    {number}
                  </span>
                  <button
                    aria-label={`Buka ${project.title}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-[#ff4f0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/70"
                    onClick={() => onOpen(project)}
                    tabIndex={isTop ? 0 : -1}
                    type="button"
                  >
                    <OpenIcon />
                  </button>
                </div>

                <h3 className="mt-3 line-clamp-2 px-3 text-center font-[family-name:var(--font-display)] text-[clamp(1.55rem,6.5vw,2.05rem)] uppercase leading-[0.98] text-white/90">
                  {project.title}
                </h3>

                <button
                  className="group relative mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-[#222425] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/70"
                  draggable={false}
                  onClick={() => onOpen(project)}
                  tabIndex={-1}
                  type="button"
                >
                  {/* Gambar yang sama diburamkan sebagai latar penuh warna. */}
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="scale-[1.35] object-cover opacity-80 blur-[22px] saturate-[1.6]"
                    draggable={false}
                    fill
                    quality={40}
                    sizes="340px"
                    src={imageSrc}
                  />
                  <div className="absolute inset-[14%] transition duration-500 [@media(hover:hover)]:group-hover:scale-[1.04]">
                    <Image
                      alt={`${project.title} visual`}
                      className="object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                      draggable={false}
                      fill
                      quality={85}
                      sizes="260px"
                      src={imageSrc}
                    />
                  </div>
                  <span className="absolute bottom-3 left-1/2 inline-flex max-w-[85%] -translate-x-1/2 items-center gap-1.5 truncate rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold uppercase text-white/90 backdrop-blur-md">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4f0a]" />
                    <span className="truncate">{project.category}</span>
                  </span>
                </button>

                <div className="px-5 pb-2 pt-4">
                  <p className="line-clamp-2 text-center text-[11.5px] leading-[1.5] text-white/45">
                    {project.description}
                  </p>
                </div>
              </article>
            );
          })}
      </div>

      <p aria-live="polite" className="sr-only">
        {current ? `${current.title}, karya ${index + 1} dari ${total}` : null}
      </p>

      <div className="mx-auto mt-4 flex max-w-xl items-center gap-4">
        <button
          aria-label="Karya sebelumnya"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] transition hover:border-[#ff4f0a]/30 hover:text-[#ff4f0a] disabled:pointer-events-none disabled:opacity-30"
          disabled={total < 2}
          onClick={() => go(-1)}
          type="button"
        >
          <ArrowIcon direction="left" />
        </button>

        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="font-[family-name:var(--font-display)] text-[12px] tabular-nums text-[color:var(--text)]/48">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} Works
          </span>
          <div
            aria-hidden="true"
            className="relative h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--text)]/10"
          >
            <div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[#ff4f0a] transition-transform duration-300"
              style={{ transform: `scaleX(${total ? (index + 1) / total : 0})` }}
            />
          </div>
          <span className="hidden md:inline-flex">
            <LiveClock />
          </span>
        </div>

        <button
          aria-label="Karya berikutnya"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] transition hover:border-[#ff4f0a]/30 hover:text-[#ff4f0a] disabled:pointer-events-none disabled:opacity-30"
          disabled={total < 2}
          onClick={() => go(1)}
          type="button"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
