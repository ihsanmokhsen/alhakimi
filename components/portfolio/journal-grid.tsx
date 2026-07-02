"use client";

import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/portfolio/fade-in";
import type { JournalView } from "@/lib/data/journals";
import { formatJournalDate } from "@/lib/utils";

type JournalGridProps = {
  journals: JournalView[];
};

const storyHeights = [
  "min-h-[420px] sm:min-h-[520px]",
  "min-h-[360px] sm:min-h-[430px]",
  "min-h-[460px] sm:min-h-[600px]",
  "min-h-[390px] sm:min-h-[500px]"
];

export function JournalGrid({ journals }: JournalGridProps) {
  if (journals.length === 0) {
    return (
      <div className="mx-auto max-w-7xl border border-black/[0.06] bg-white p-10 text-center shadow-[0_22px_80px_rgba(18,22,34,0.08)]">
        <p className="text-[14px] font-bold text-black/52">No stories published yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-10 flex flex-col justify-between gap-4 border-t border-black/[0.08] pt-8 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-[12px] font-black uppercase text-[#2563ff]">
            <span className="h-2 w-2 rounded-full bg-[#2563ff] animate-pulse" />
            Latest entries
          </p>
          <h2 className="mt-2 bg-gradient-to-r from-black via-[#2563ff] to-black bg-[length:200%_auto] bg-clip-text text-[32px] font-black leading-none tracking-tight text-transparent sm:text-[44px]" style={{ animation: "gradientText 4s ease infinite" }}>
            Modern journals
          </h2>
        </div>
        <p className="max-w-sm text-[14px] font-medium leading-6 text-black/50">
          Editorial notes presented with the same calm, intelligent visual language as the main showcase.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {journals.map((journal, index) => {
          const photoVersion = new Date(journal.updatedAt).getTime();

          return (
            <FadeIn delay={index * 80} key={journal.id}>
            <Link
              className={`group relative block overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_22px_80px_rgba(18,22,34,0.10)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_100px_rgba(18,22,34,0.18),0_0_40px_-4px_rgba(37,99,255,0.12)] hover:border-[#2563ff]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563ff]/50 focus-visible:ring-offset-2 ${
                storyHeights[index % storyHeights.length]
              }`}
              href={`/journal/${journal.id}`}
              key={journal.id}
              style={{ animation: `subtleFloat ${4.5 + index * 0.5}s ease-in-out infinite` }}
            >
              {/* Glow ring on hover */}
              <div aria-hidden="true" className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(135deg, rgba(37,99,255,0.15), rgba(139,92,246,0.1), rgba(37,99,255,0.06))", filter: "blur(1px)" }} />

              <article className="flex h-full flex-col">
                {journal.hasPhoto ? (
                  <div className="relative min-h-56 flex-1 overflow-hidden bg-[#ebecef]">
                    <Image
                      alt={`Foto untuk ${journal.title}`}
                      className="object-cover transition duration-700 group-hover:scale-110"
                      fill
                      quality={85}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
                    />
                    {/* Shine overlay on hover */}
                    <div aria-hidden="true" className="card-shine-overlay" />
                    {/* Blue glow overlay on hover */}
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#2563ff]/12 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                ) : (
                  <div className="relative min-h-56 flex-1 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff,#eceef5_52%,#dfe8ff)] bg-[length:200%_200%] transition-all duration-500 group-hover:saturate-150" style={{ animation: "gradientShiftSlow 6s ease infinite" }} />
                    {/* Shine overlay */}
                    <div aria-hidden="true" className="card-shine-overlay" />
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <p className="text-[12px] font-black uppercase text-[#2563ff]">
                    {formatJournalDate(journal.publishedAt)}
                  </p>
                  <h3 className="mt-4 text-[28px] font-black leading-none tracking-tight text-black transition-colors duration-300 group-hover:text-[#2563ff] sm:text-[34px]">
                    {journal.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-[14px] font-medium leading-7 text-black/56">
                    {journal.content}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-[12px] font-bold text-white transition-all duration-300 group-hover:bg-[#2563ff] group-hover:shadow-[0_8px_24px_rgba(37,99,255,0.35)] group-hover:gap-3">
                    Read Story
                    <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
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
