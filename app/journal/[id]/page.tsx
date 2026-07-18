import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JournalShare } from "@/components/portfolio/journal-share";
import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { getJournalById } from "@/lib/data/journals";
import { absoluteUrl, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { formatJournalDate } from "@/lib/utils";

type JournalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: JournalDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const journal = await getJournalById(id);

  if (!journal) {
    return { title: "Story tidak ditemukan", robots: { index: false, follow: false } };
  }

  const description = journal.content.replace(/\s+/g, " ").trim().slice(0, 160);
  const path = `/journal/${encodeURIComponent(journal.id)}`;
  const image = journal.hasPhoto ? `/api/journal-photo/${encodeURIComponent(journal.id)}` : "/hero.jpg";

  return {
    title: journal.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: journal.title,
      description,
      url: path,
      type: "article",
      publishedTime: journal.publishedAt.toISOString(),
      modifiedTime: journal.updatedAt.toISOString(),
      authors: ["Muhammad Ihsanul Hakim Mokhsen"],
      images: [{ url: image, alt: journal.title }]
    }
  };
}

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { id } = await params;
  const journal = await getJournalById(id);

  if (!journal) {
    notFound();
  }

  const photoVersion = new Date(journal.updatedAt).getTime();
  const journalPath = `/journal/${encodeURIComponent(journal.id)}`;
  const journalUrl = absoluteUrl(journalPath);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Stories", path: "/journal" },
            { name: journal.title, path: journalPath }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": `${journalUrl}#article`,
            headline: journal.title,
            description: journal.content.replace(/\s+/g, " ").trim().slice(0, 160),
            articleBody: journal.content,
            datePublished: journal.publishedAt.toISOString(),
            dateModified: journal.updatedAt.toISOString(),
            author: { "@id": `${SITE_URL}/#person` },
            publisher: { "@id": `${SITE_URL}/#person` },
            image: journal.hasPhoto
              ? absoluteUrl(`/api/journal-photo/${encodeURIComponent(journal.id)}`)
              : absoluteUrl("/hero.jpg"),
            mainEntityOfPage: journalUrl,
            inLanguage: "id-ID"
          }
        ]}
      />
      <MaknaHeader active="stories" />

      <article className="mx-auto w-full max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <Link
          className="inline-flex border border-[color:var(--border-solid)] bg-[color:var(--surface)] px-5 py-3 text-[12px] font-black text-[color:var(--text)]/56 shadow-[0_14px_40px_rgba(18,22,34,0.08)] transition hover:-translate-y-0.5 hover:text-[#2563ff]"
          href="/journal"
        >
          Back to Stories
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <header>
            <p className="text-[12px] font-black uppercase text-[#2563ff]">
              {formatJournalDate(journal.publishedAt)}
            </p>
            <h1 className="mt-5 text-[clamp(3.6rem,8vw,7.5rem)] font-black leading-[0.88] tracking-normal text-[color:var(--text)]">
              {journal.title}
            </h1>
            <div className="mt-6">
              <JournalShare title={journal.title} />
            </div>
          </header>

          <section className="overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_24px_90px_rgba(18,22,34,0.12)]">
            {journal.hasPhoto ? (
              <div className="relative min-h-[320px] overflow-hidden bg-[#ebecef] sm:min-h-[460px]">
                <Image
                  alt={`Foto untuk ${journal.title}`}
                  className="object-cover"
                  fill
                  priority
                  quality={85}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  src={`/api/journal-photo/${journal.id}?v=${photoVersion}`}
                />
              </div>
            ) : null}

            <div className="p-6 sm:p-8 lg:p-10">
              <p className="whitespace-pre-wrap text-[16px] font-medium leading-8 text-[color:var(--text)]/62 sm:text-[18px] sm:leading-9">
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
