"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Maskot works: satu sprite sheet 3 kolom × 6 baris (public/mascot/mascot-sheet.webp).
 * Baris 0–2 berisi arah kepala (grid 3×3 sesuai arah pandang), baris 3–5 berisi ekspresi.
 * Satu file + background-position supaya ganti ekspresi tidak berkedip memuat gambar baru.
 */
const POSES = {
  lookUpLeft: 0,
  lookUp: 1,
  lookUpRight: 2,
  lookLeft: 3,
  talk: 4,
  lookRight: 5,
  lookDownLeft: 6,
  lookDown: 7,
  lookDownRight: 8,
  confused: 9,
  laugh: 10,
  smug: 11,
  angry: 12,
  flustered: 13,
  tired: 14,
  sick: 15,
  shocked: 16,
  starstruck: 17
} as const;

export type MascotPose = keyof typeof POSES;

const LOOK_GRID: MascotPose[][] = [
  ["lookUpLeft", "lookUp", "lookUpRight"],
  ["lookLeft", "talk", "lookRight"],
  ["lookDownLeft", "lookDown", "lookDownRight"]
];

type MascotProps = {
  pose: MascotPose;
  /** Ukuran dalam px; kosongkan untuk mengikuti ukuran dari className (mis. h-full w-full). */
  size?: number;
  className?: string;
  /** Kosongkan bila maskot hanya dekorasi (aria-hidden). */
  label?: string;
};

export function Mascot({ pose, size, className = "", label }: MascotProps) {
  const index = POSES[pose];
  const col = index % 3;
  const row = Math.floor(index / 3);

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={`inline-block shrink-0 bg-no-repeat ${className}`}
      role={label ? "img" : undefined}
      style={{
        ...(size ? { width: size, height: size } : null),
        backgroundImage: "url(/mascot/mascot-sheet.webp)",
        backgroundSize: "300% 600%",
        backgroundPosition: `${col * 50}% ${row * 20}%`
      }}
    />
  );
}

/** Ambang cos(67.5°): di luar sudut ini pandangan dianggap miring ke samping/atas/bawah. */
const AXIS_THRESHOLD = 0.38;

function axisStep(component: number) {
  if (component < -AXIS_THRESHOLD) return 0;
  if (component > AXIS_THRESHOLD) return 2;
  return 1;
}

/**
 * Arah pandang maskot mengikuti kursor. Mengembalikan `null` sebelum ada gerakan pointer
 * (misalnya di perangkat sentuh), sehingga pemanggil bisa memakai pose default sendiri.
 */
export function useMascotLook(targetRef: RefObject<HTMLElement | null>) {
  const [pose, setPose] = useState<MascotPose | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    function update() {
      frame = 0;
      const el = targetRef.current;
      if (!el || !lastEvent) return;

      const rect = el.getBoundingClientRect();
      const dx = lastEvent.clientX - (rect.left + rect.width / 2);
      const dy = lastEvent.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);

      // Kursor tepat di atas maskot: biarkan pemanggil menentukan reaksi lewat hover.
      const next =
        distance < rect.width / 2
          ? "talk"
          : LOOK_GRID[axisStep(dy / distance)][axisStep(dx / distance)];

      setPose((current) => (current === next ? current : next));
    }

    function onPointerMove(event: PointerEvent) {
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return pose;
}
