"use client";

import { useRef, useState } from "react";

import { Mascot, useMascotLook } from "@/components/portfolio/mascot";

/** Maskot halaman 404: bingung saat diam, mengikuti kursor, kaget kalau disentuh. */
export function NotFoundMascot() {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const look = useMascotLook(ref);

  return (
    <div
      className="mx-auto h-32 w-32 sm:h-40 sm:w-40"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      ref={ref}
    >
      <Mascot
        className="h-full w-full"
        label="Maskot works kebingungan"
        pose={isHovered ? "shocked" : (look ?? "confused")}
      />
    </div>
  );
}
