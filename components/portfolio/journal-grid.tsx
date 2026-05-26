"use client";

import Image from "next/image";
import Link from "next/link";

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
          <p className="text-[12px] font-black uppercase text-[#2563ff]">Latest entries</p>
          <h2 className="mt-2 text-[32px] font-black leading-none text-black sm:text-[44px]">Modern journals</h2>
        </div>
        <p className="max-w-sm text-[14px] font-medium leading-6 text-black/50">
          Editorial notes presented with the same calm, intelligent visual language as the main showcase.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {journals.map((journal, index) => {
          const photoVersion = new Date(journal.updatedAt).getTime();

          return (
            <Link
              className={`group block overflow-hidden border border-black/[0.06] bg-white shadow-[0_22px_80px_rgba(18,22,34,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_100px_rgba(18,22,34,0.16)] ${
                storyHeights[index % storyHeights.length]
              }`}
              href={`/journal/${journal.id}`}
              key={journal.id}
            >
              <article className="flex h-full flex-col">
                {journal.hasPhoto ? (
                  <div className="relative min-h-56 flex-1 overflow-hidden bg-[#ebecef]">
                    <Image
                      alt={`Foto untuk ${journal.title}`}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
                    />
                  </div>
                ) : (
                  <div className="min-h-56 flex-1 bg-[linear-gradient(135deg,#ffffff,#eceef5_52%,#dfe8ff)]" />
                )}

                <div className="p-5 sm:p-6">
                  <p className="text-[12px] font-black uppercase text-[#2563ff]">
                    {formatJournalDate(journal.publishedAt)}
                  </p>
                  <h3 className="mt-4 text-[28px] font-black leading-none tracking-normal text-black sm:text-[34px]">
                    {journal.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-[14px] font-medium leading-7 text-black/56">
                    {journal.content}
                  </p>
                  <span className="mt-6 inline-flex bg-black px-4 py-2 text-[12px] font-bold text-white transition group-hover:bg-[#2563ff]">
                    Read Story
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
