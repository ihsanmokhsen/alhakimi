"use client";

import { useEffect, useState } from "react";

function formatNow(date: Date) {
  return {
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(date),
    dateFull: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date)
  };
}

type HeaderClockProps = {
  light?: boolean;
};

export function HeaderClock({ light = false }: HeaderClockProps) {
  // Halaman dirender statis, jadi waktu server sudah basi saat sampai di browser.
  // Jam baru diisi setelah mount agar HTML server dan klien sama (tanpa hydration error).
  const [now, setNow] = useState<ReturnType<typeof formatNow> | null>(null);

  useEffect(() => {
    setNow(formatNow(new Date()));
    const timer = window.setInterval(() => {
      setNow(formatNow(new Date()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const c = light ? "text-white" : "text-[color:var(--text)]";

  return (
    <div className={`shrink-0 text-center ${c}`}>
      <p className="text-[22px] font-black leading-none tracking-tight">
        {now?.time ?? "\u00a0"}
      </p>
      <p className={`mt-2 text-[13px] font-black uppercase tracking-[0.08em] ${light ? "text-white/80" : "text-[color:var(--text)]/80"}`}>
        {now?.dateFull ?? "\u00a0"}
      </p>
    </div>
  );
}
