"use client";

import { useEffect, useRef } from "react";

type Particle = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
};

export function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Generate particles only once
    if (particles.current.length === 0) {
      const generated: Particle[] = [];
      for (let i = 0; i < 25; i++) {
        generated.push({
          id: i,
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 12}s`,
          duration: `${8 + Math.random() * 18}s`,
          size: `${2 + Math.random() * 4}px`,
        });
      }
      particles.current = generated;
    }

    // Force a re-render by updating the container's innerHTML
    // We use a different approach — just render the particles via state
    const el = containerRef.current;
    if (!el) return;

    // Clear and rebuild
    el.innerHTML = "";
    particles.current.forEach((p) => {
      const div = document.createElement("div");
      div.className = "floating-particle";
      div.style.left = p.left;
      div.style.bottom = "0";
      div.style.animationDelay = p.delay;
      div.style.animationDuration = p.duration;
      div.style.width = p.size;
      div.style.height = p.size;
      el.appendChild(div);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
    />
  );
}