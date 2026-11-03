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
    }).format(date),
    weekday: new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date),
    week: isoWeek(date)
  };
}

/** Nomor minggu ISO-8601 (minggu dimulai Senin), seperti yang ditampilkan time.is. */
function isoWeek(date: Date) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return Math.ceil(((day.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

type HeaderClockProps = {
  light?: boolean;
  /** Tampilan besar ala time.is untuk hero halaman depan. */
  hero?: boolean;
};

export function HeaderClock({ light = false, hero = false }: HeaderClockProps) {
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

  if (hero) {
    const muted = light ? "text-white/80" : "text-[color:var(--text)]/80";

    return (
      <div className={`shrink-0 text-center ${c}`}>
        <p className={`text-[14px] font-medium leading-tight sm:text-[17px] ${muted}`}>
          Waktu di <strong className={`font-black ${light ? "text-white" : "text-[color:var(--text)]"}`}>Kupang</strong>,
          Indonesia sekarang
        </p>
        <p className="mt-1 text-[clamp(2.75rem,9vw,5rem)] font-black leading-none tabular-nums tracking-tight">
          {now
            ? now.time.split(/[.:]/).map((part, index) => (
                <span key={index}>
                  {index > 0 ? <span className="relative -top-[0.08em] mx-[0.04em]">:</span> : null}
                  {part}
                </span>
              ))
            : "\u00a0"}
        </p>
        <p className={`mt-2 text-[13px] font-medium sm:text-[15px] ${muted}`}>
          {now ? `${now.weekday}, ${now.dateFull}, minggu ${now.week}` : "\u00a0"}
        </p>
      </div>
    );
  }

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
