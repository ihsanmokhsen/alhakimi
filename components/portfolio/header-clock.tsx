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
  const [now, setNow] = useState(() => formatNow(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(formatNow(new Date()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const c = light ? "text-white" : "text-black";

  return (
    <div className={`shrink-0 text-center ${c}`}>
      <p className="text-[22px] font-black leading-none tracking-tight">
        {now.time}
      </p>
      <p className={`mt-2 text-[13px] font-black uppercase tracking-[0.08em] ${light ? "text-white/80" : "text-black/80"}`}>
        {now.dateFull}
      </p>
    </div>
  );
}
