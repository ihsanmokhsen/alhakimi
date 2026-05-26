import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";
import { getJournalById } from "@/lib/data/journals";
import { formatJournalDate } from "@/lib/utils";

type JournalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { id } = await params;
  const journal = await getJournalById(id);

  if (!journal) {
    notFound();
  }

  const photoVersion = new Date(journal.updatedAt).getTime();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader active="stories" />

      <article className="mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <Link
          className="inline-flex border border-black/10 bg-white px-5 py-3 text-[12px] font-black text-black/56 shadow-[0_14px_40px_rgba(18,22,34,0.08)] transition hover:-translate-y-0.5 hover:text-[#2563ff]"
          href="/journal"
        >
          Back to Stories
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <header>
            <p className="text-[12px] font-black uppercase text-[#2563ff]">
              {formatJournalDate(journal.publishedAt)}
            </p>
            <h1 className="mt-5 text-[clamp(3.6rem,8vw,7.5rem)] font-black leading-[0.88] tracking-normal text-black">
              {journal.title}
            </h1>
          </header>

          <section className="overflow-hidden border border-black/[0.06] bg-white shadow-[0_24px_90px_rgba(18,22,34,0.12)]">
            {journal.hasPhoto ? (
              <div className="relative min-h-[320px] overflow-hidden bg-[#ebecef] sm:min-h-[460px]">
                <Image
                  alt={`Foto untuk ${journal.title}`}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
                />
              </div>
            ) : null}

            <div className="p-6 sm:p-8 lg:p-10">
              <p className="whitespace-pre-wrap text-[16px] font-medium leading-8 text-black/62 sm:text-[18px] sm:leading-9">
                {journal.content}
              </p>
            </div>
          </section>
        </div>
      </article>

      <MaknaFooter />
    </main>
  );
}
