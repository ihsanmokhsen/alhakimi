"use client";

import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/portfolio/fade-in";
import type { JournalView } from "@/lib/data/journals";
import { formatJournalDate } from "@/lib/utils";

type JournalGridProps = {
  journals: JournalView[];
};

export function JournalGrid({ journals }: JournalGridProps) {
  if (journals.length === 0) {
    return (
      <div className="mx-auto max-w-7xl border border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center shadow-[var(--shadow-card)]">
        <p className="text-[14px] font-bold text-[color:var(--text)]/52">No stories published yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-t border-[color:var(--border-strong)] pt-8 sm:mb-10 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-[12px] font-black uppercase text-[#ff4f0a]">
            <span className="h-2 w-2 bg-[#ff4f0a] animate-pulse" />
            Latest entries
          </p>
          <h2
            className="mt-2 bg-gradient-to-r from-black via-[#ff4f0a] to-black bg-[length:200%_auto] bg-clip-text text-[32px] font-black leading-none tracking-tight text-transparent sm:text-[44px]"
            style={{ animation: "gradientText 4s ease infinite" }}
          >
            Modern journals
          </h2>
        </div>
        <p className="max-w-sm text-[14px] font-medium leading-6 text-[color:var(--text)]/50">
          Editorial notes presented in a cleaner horizontal reading flow for every screen size.
        </p>
      </div>

      <div className="border-t border-[color:var(--border)]">
        {journals.map((journal, index) => {
          const photoVersion = new Date(journal.updatedAt).getTime();

          return (
            <FadeIn delay={index * 70} key={journal.id}>
              <Link
                className="group block border-b border-[color:var(--border)] py-5 transition duration-300 hover:bg-[color:var(--surface)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4f0a]/50 focus-visible:ring-offset-2 sm:py-7 lg:py-8"
                href={`/journal/${journal.id}`}
              >
                <article className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-7 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-10">
                  {journal.hasPhoto ? (
                    <div className="relative h-32 overflow-hidden bg-[#e1e5e3] sm:h-48 lg:h-64">
                      <Image
                        alt={`Foto untuk ${journal.title}`}
                        className="object-cover transition duration-700 group-hover:scale-105"
                        fill
                        quality={85}
                        sizes="(max-width: 640px) 112px, (max-width: 1024px) 224px, 352px"
                        src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
                      />
                      <div aria-hidden="true" className="card-shine-overlay" />
                    </div>
                  ) : (
                    <div className="relative flex h-32 items-end overflow-hidden bg-[#e1e5e3] p-3 sm:h-48 sm:p-5 lg:h-64">
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff,#e5e8e6_52%,#ffe0d4)] bg-[length:200%_200%]"
                        style={{ animation: "gradientShiftSlow 6s ease infinite" }}
                      />
                      <p className="relative line-clamp-3 text-[24px] font-black leading-[0.86] tracking-normal text-black/[0.14] sm:text-[44px]">
                        {journal.title}
                      </p>
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col justify-between py-1 sm:py-2 lg:py-3">
                    <div>
                      <p className="text-[10px] font-black uppercase leading-none text-[#ff4f0a] sm:text-[12px]">
                        {String(index + 1).padStart(2, "0")} / {formatJournalDate(journal.publishedAt)}
                      </p>
                      <h3 className="mt-3 line-clamp-2 text-[22px] font-black leading-[0.94] tracking-tight text-[color:var(--text)] transition-colors duration-300 group-hover:text-[#ff4f0a] sm:mt-4 sm:text-[38px] lg:text-[54px]">
                        {journal.title}
                      </h3>
                    </div>
                    <p className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 text-[color:var(--text)]/56 sm:mt-5 sm:line-clamp-3 sm:text-[15px] sm:leading-7 lg:max-w-3xl">
                      {journal.content}
                    </p>
                    <span className="mt-4 hidden w-fit items-center gap-2 bg-black px-4 py-2.5 text-[12px] font-bold text-white transition-all duration-300 group-hover:bg-[#ff4f0a] group-hover:shadow-[0_8px_24px_rgba(255,79,10,0.28)] sm:inline-flex">
                      Read Story
                      <svg
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </article>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
