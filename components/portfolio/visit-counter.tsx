"use client";

import { useEffect, useState } from "react";

const numberFormatter = new Intl.NumberFormat("id-ID");

export function VisitCounter() {
  const [total, setTotal] = useState<number>();

  useEffect(() => {
    let active = true;

    fetch("/api/visits", {
      method: "POST",
      cache: "no-store"
    })
      .then((response) => {
        if (!response.ok) throw new Error("Visit counter request failed");
        return response.json() as Promise<{ total: number }>;
      })
      .then((data) => {
        if (active && Number.isFinite(data.total)) setTotal(data.total);
      })
      .catch(() => {
        // The public footer stays usable when analytics is temporarily unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <span aria-live="polite">
      {total === undefined ? "Menghitung kunjungan" : `${numberFormatter.format(total)} kunjungan`}
    </span>
  );
}
