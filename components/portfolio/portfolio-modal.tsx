"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Project } from "@prisma/client";

import { GlassCard } from "@/components/ui/glass-card";

type PortfolioModalProps = {
  project: Project;
  onClose: () => void;
};

export function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-36"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,74,34,0.18),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(255,145,77,0.18),transparent_22%),linear-gradient(180deg,rgba(8,8,8,0.44),rgba(11,11,11,0.88)),rgba(11,11,11,0.38)] backdrop-blur-[10px]"
      />
      <button
        aria-label="Close project detail"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <GlassCard className="relative flex w-full max-w-[320px] flex-col overflow-hidden border-[color:var(--ui-border)] bg-[image:var(--ui-card)] p-3 sm:max-w-[520px] sm:p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,74,34,0.22),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(255,160,85,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,112,92,0.12),transparent_28%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[8px] uppercase tracking-[0.2em] text-[color:var(--ui-soft)]">{project.category}</p>
            <h2 className="mt-2 text-[13px] font-semibold leading-none tracking-tight text-[color:var(--ui-strong)] sm:text-[18px]">
              {project.title}
            </h2>
          </div>
          <button
            className="rounded-full border border-[color:var(--ui-border)] bg-[var(--ui-chip)] px-2 py-1 text-[6px] uppercase tracking-[0.14em] text-[color:var(--ui-muted)] transition hover:text-accent"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="relative mt-4 grid gap-3 sm:grid-cols-[1.05fr_0.95fr] sm:gap-4">
          <div>
            <p className="text-[8px] leading-4 text-[color:var(--ui-muted)] sm:text-[9px] sm:leading-4.5">{project.description}</p>
          </div>
          <div className="space-y-2.5">
            <div className="rounded-[18px] border border-[color:var(--ui-border)] bg-[var(--ui-chip)] p-2.5">
              <p className="text-[6px] uppercase tracking-[0.14em] text-[color:var(--ui-soft)]">Project link</p>
              <Link
                className="mt-1.5 inline-flex text-[7px] text-[color:var(--ui-strong)] transition hover:text-accent sm:text-[8px]"
                href={project.url}
                rel="noreferrer"
                target="_blank"
              >
                Open application
              </Link>
            </div>
            <div className="rounded-[18px] border border-[color:var(--ui-border)] bg-[var(--ui-chip)] p-2.5">
              <p className="text-[6px] uppercase tracking-[0.14em] text-[color:var(--ui-soft)]">Added</p>
              <p className="mt-1.5 text-[7px] text-[color:var(--ui-muted)] sm:text-[8px]">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium"
                }).format(project.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
