"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import type { ProjectCard } from "@/lib/data/projects";

type WorksShowcaseProps = {
  projects: ProjectCard[];
  onOpen: (project: ProjectCard) => void;
};

/** Kecepatan putar otomatis roda (derajat per detik). */
const AUTO_SPEED = 3.2;
/** Derajat putaran per piksel seretan. */
const DRAG_RATIO = 0.18;
/** Jarak geser (px) sebelum seretan dianggap drag, bukan klik. */
const DRAG_THRESHOLD = 6;

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

/**
 * Roda karya: semua aplikasi tersusun melingkar seperti kipas di atas piringan pusat
 * yang bertuliskan teks melingkar. Roda berputar pelan sendiri, bisa diseret, atau
 * digeser dengan tombol panah; karya yang sedang di puncak tampil di piringan.
 */
export function WorksShowcase({ projects, onOpen }: WorksShowcaseProps) {
  const total = projects.length;
  const step = total ? 360 / total : 0;

  const wheelRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ rotation: 0, target: 0, paused: false });
  const drag = useRef({ active: false, moved: false, startX: 0, startTarget: 0 });
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const state = motion.current;
      if (!state.paused && !drag.current.active && !reduced) state.target -= AUTO_SPEED * dt;
      // Putaran mengejar target dengan halus, agar tombol panah & seretan terasa lembut.
      state.rotation += (state.target - state.rotation) * Math.min(1, dt * 7);
      if (wheelRef.current) wheelRef.current.style.setProperty("--spin", `${state.rotation}deg`);

      if (step) {
        const top = ((Math.round(-state.rotation / step) % total) + total) % total;
        setActive((current) => (current === top ? current : top));
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step, total]);

  function rotateBy(direction: 1 | -1) {
    const state = motion.current;
    // Kunci ke karya terdekat lalu pindah satu langkah.
    state.target = Math.round(state.target / step) * step - direction * step;
  }

  function bringToTop(index: number) {
    const state = motion.current;
    const current = Math.round(-state.target / step);
    const offset = ((((index - current) % total) + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);
    state.target = -(current + offset) * step;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { active: true, moved: false, startX: event.clientX, startTarget: motion.current.target };
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
    if (state.moved) motion.current.target = state.startTarget + delta * DRAG_RATIO;
  }

  function handlePointerUp() {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      rotateBy(-1);
    }
  }

  const current = projects[active];

  return (
    <div className="works-orbit-wrap">
      <div
        aria-label="Roda works"
        aria-roledescription="carousel"
        className={`works-orbit relative left-1/2 w-screen -translate-x-1/2 touch-pan-y select-none overflow-hidden outline-none ${
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
        onPointerEnter={() => (motion.current.paused = true)}
        onPointerLeave={() => {
          motion.current.paused = false;
          handlePointerUp();
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="region"
        tabIndex={0}
      >
        {/* Piringan pusat dengan teks melingkar yang berputar berlawanan arah. */}
        <div aria-hidden="true" className="works-orbit-dial pointer-events-none absolute">
          <svg className="works-orbit-ring h-full w-full" viewBox="0 0 200 200">
            <defs>
              <path d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" id="works-orbit-path" />
            </defs>
            <circle cx="100" cy="100" fill="none" r="98" stroke="currentColor" strokeDasharray="2 5" strokeOpacity="0.35" />
            <text className="fill-current text-[8.4px] font-bold uppercase" letterSpacing="3.2" opacity="0.4">
              <textPath href="#works-orbit-path">
                Works • Ihsan Mokhsen • Aplikasi • Karya Digital • Works • Ihsan Mokhsen • Aplikasi • Karya Digital •
              </textPath>
            </text>
          </svg>
        </div>

        <div className="works-orbit-wheel absolute" ref={wheelRef}>
          {projects.map((project, index) => {
            const imageSrc = `/api/project-logo/${project.id}?v=${new Date(project.updatedAt).getTime()}`;
            const isActive = index === active;

            return (
              <div
                className="works-orbit-slot absolute left-0 top-0"
                key={project.id}
                style={{ transform: `rotate(${index * step}deg)` }}
              >
                <button
                  aria-label={`Buka ${project.title}`}
                  className={`works-orbit-tile group relative block overflow-hidden rounded-[18px] bg-[#161718] text-left focus-visible:outline-none sm:rounded-[24px] ${
                    isActive ? "is-active" : ""
                  }`}
                  draggable={false}
                  onClick={() => onOpen(project)}
                  onFocus={() => bringToTop(index)}
                  type="button"
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="scale-[1.4] object-cover opacity-90 blur-[20px] saturate-[1.5]"
                    draggable={false}
                    fill
                    quality={40}
                    sizes="(min-width: 768px) 220px, 130px"
                    src={imageSrc}
                  />
                  <Image
                    alt={`${project.title} visual`}
                    className="object-contain"
                    draggable={false}
                    fill
                    quality={85}
                    sizes="(min-width: 768px) 220px, 130px"
                    src={imageSrc}
                  />
                  <span className="absolute right-2.5 top-2 font-[family-name:var(--font-display)] text-[10px] leading-none text-white mix-blend-difference sm:right-3.5 sm:top-3 sm:text-[12px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[6px] border-x-transparent border-b-white mix-blend-difference sm:top-3"
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Label karya di puncak roda, diletakkan di atas piringan seperti "ME" di tengah. */}
        <div className="works-orbit-info pointer-events-none absolute left-1/2 flex w-[min(78%,420px)] -translate-x-1/2 flex-col items-center text-center">
          <span aria-hidden="true" className="h-0 w-0 border-x-[6px] border-b-[9px] border-x-transparent border-b-[color:var(--text)]" />
          {current ? (
            <>
              <p className="mt-3 text-[10px] font-black uppercase text-[#ff4f0a] sm:text-[11px]">
                {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {current.category}
              </p>
              <h3 className="mt-1.5 line-clamp-2 font-[family-name:var(--font-display)] text-[clamp(1.15rem,3.4vw,2.1rem)] uppercase leading-[0.98] text-[color:var(--text)]">
                {current.title}
              </h3>
              <button
                className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--text)] px-4 py-2 text-[11px] font-black uppercase text-[color:var(--surface)] transition hover:bg-[#ff4f0a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/60"
                onClick={() => onOpen(current)}
                type="button"
              >
                Lihat karya
              </button>
            </>
          ) : null}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {current ? `${current.title}, karya ${active + 1} dari ${total}` : null}
      </p>

      <div className="mx-auto mt-2 flex max-w-xs items-center justify-center gap-4">
        <button
          aria-label="Karya sebelumnya"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--text)] transition hover:border-[#ff4f0a]/40 hover:text-[#ff4f0a]"
          onClick={() => rotateBy(-1)}
          type="button"
        >
          <ArrowIcon direction="left" />
        </button>
        <span className="text-[10px] font-bold uppercase text-[color:var(--text)]/40">Seret untuk memutar</span>
        <button
          aria-label="Karya berikutnya"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--text)] transition hover:border-[#ff4f0a]/40 hover:text-[#ff4f0a]"
          onClick={() => rotateBy(1)}
          type="button"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
