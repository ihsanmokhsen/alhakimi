"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    fetch("/api/visits", {
      method: "POST",
      cache: "no-store"
    }).catch(() => {
      // Visit tracking must never interrupt the public website.
    });
  }, []);

  return null;
}
