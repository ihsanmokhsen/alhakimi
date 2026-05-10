import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { BackgroundLayer } from "@/components/portfolio/background-layer";
import { BottomNav } from "@/components/portfolio/bottom-nav";
import { EmailButton } from "@/components/portfolio/email-button";
import { SiteHeader } from "@/components/portfolio/site-header";
import { GlassCard } from "@/components/ui/glass-card";
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
    <main className="relative isolate min-h-screen px-4 pt-3 pb-8 sm:px-6 sm:pt-4">
      <BackgroundLayer />

      <SiteHeader light />

      <div className="mx-auto mt-10 max-w-4xl space-y-5">
        <Link
          className="inline-flex rounded-full border border-[color:var(--public-border)] bg-[color:var(--public-surface)] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-[color:var(--public-text-muted)] transition hover:text-accent"
          href="/journal"
        >
          Back to journal
        </Link>

        <GlassCard className="border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--public-text-soft)]">
              {formatJournalDate(journal.publishedAt)}
            </p>
            <h1 className="text-2xl font-semibold leading-tight text-[color:var(--public-text-strong)] sm:text-4xl">
              {journal.title}
            </h1>
          </div>

          {journal.hasPhoto ? (
            <div className="relative mt-6 h-40 w-40 overflow-hidden rounded-2xl border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] sm:h-48 sm:w-48">
              <Image
                alt={`Foto untuk ${journal.title}`}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 160px, 192px"
                src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-[24px] border border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] p-5 sm:p-6">
            <p className="whitespace-pre-wrap text-sm leading-8 text-[color:var(--public-text-muted)] sm:text-[15px]">
              {journal.content}
            </p>
          </div>
        </GlassCard>
      </div>

      <EmailButton />
      <BottomNav />
    </main>
  );
}
