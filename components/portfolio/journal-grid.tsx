"use client";

import type { Journal } from "@prisma/client";

import { formatJournalDate } from "@/lib/utils";

type JournalGridProps = {
  journals: Journal[];
};

export function JournalGrid({ journals }: JournalGridProps) {
  if (journals.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.26em] text-[color:var(--public-text-soft)]">Journal</p>
        </div>
      </div>

      <div className="space-y-5">
        {journals.map((journal) => (
          <article
            className="mx-auto max-w-4xl rounded-[28px] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-8"
            key={journal.id}
          >
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--public-text-soft)]">
                {formatJournalDate(journal.publishedAt)}
              </p>
              <h3 className="text-2xl font-semibold leading-tight text-[color:var(--public-text-strong)] sm:text-3xl">
                {journal.title}
              </h3>
            </div>

            <p className="mt-6 whitespace-pre-wrap text-sm leading-8 text-[color:var(--public-text-muted)] sm:text-[15px]">
              {journal.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
