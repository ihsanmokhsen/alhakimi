"use client";

import { useEffect, useState } from "react";

function formatNow(date: Date) {
  return {
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date),
    date: new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date)
  };
}

export function HeaderClock() {
  const [now, setNow] = useState(() => formatNow(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(formatNow(new Date()));
    }, 1000 * 30);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="shrink-0 text-right">
      <p className="text-[8px] font-semibold tracking-[0.08em] text-[color:var(--ui-strong)] sm:text-[9px]">
        {now.time}
      </p>
      <p className="mt-1 text-[7px] uppercase tracking-[0.16em] text-[color:var(--ui-soft)] sm:text-[8px]">
        {now.date}
      </p>
    </div>
  );
}
