import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { getEssays } from "@/lib/data/essays";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { formatJournalDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Essays",
  description: "Essay panjang dan pemikiran serius Ihsan Mokhsen tentang teknologi, produk, kerja kreatif, dan kehidupan digital.",
  alternates: { canonical: "/essays" },
  openGraph: {
    title: "Essays oleh Ihsan Mokhsen",
    description: "Tulisan panjang tentang teknologi, produk, kerja kreatif, dan kehidupan digital.",
    url: "/essays",
    type: "website"
  }
};

export default async function EssaysPage() {
  const essays = await getEssays();

  return (
    <main className="min-h-screen bg-white text-[#111113]">
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Beranda", path: "/" }, { name: "Essays", path: "/essays" }]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/essays#collection`,
          url: `${SITE_URL}/essays`,
          name: "Essays oleh Ihsan Mokhsen",
          description: "Tulisan panjang tentang teknologi, produk, kerja kreatif, dan kehidupan digital.",
          author: { "@id": `${SITE_URL}/#person` },
          inLanguage: "id-ID"
        }
      ]} />
      <WorksHeader active="essays" />

      <header className="mx-auto w-full max-w-5xl px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-28">
        <p className="text-[12px] font-black uppercase text-[#2563ff]">Essays</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(3.7rem,10vw,8rem)] font-black leading-[0.88] tracking-normal">
          Gagasan yang diberi waktu.
        </h1>
        <p className="mt-8 max-w-2xl text-[17px] font-medium leading-8 text-black/55 sm:text-[20px]">
          Tulisan panjang tentang hal-hal yang layak dipikirkan lebih serius.
        </p>
      </header>

      <section className="mx-auto w-full max-w-5xl border-t border-black/12 px-4 pb-28 sm:px-6">
        {essays.length === 0 ? (
          <p className="py-20 text-[17px] font-semibold text-black/42">Essay pertama sedang disiapkan.</p>
        ) : (
          essays.map((essay, index) => (
            <article className="grid gap-7 border-b border-black/12 py-10 sm:py-14 lg:grid-cols-[190px_minmax(0,1fr)_220px]" key={essay.id}>
              <div>
                <p className="text-[11px] font-black uppercase text-[#2563ff]">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-2 text-[12px] font-bold text-black/42">{formatJournalDate(essay.publishedAt)}</p>
              </div>
              <div>
                <h2 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[0.98] tracking-normal">
                  <Link className="transition hover:text-[#2563ff]" href={`/essays/${essay.slug}`}>{essay.title}</Link>
                </h2>
                <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-black/55 sm:text-[17px]">{essay.excerpt}</p>
                <Link className="mt-6 inline-flex border-b-2 border-black pb-1 text-[12px] font-black uppercase transition hover:border-[#2563ff] hover:text-[#2563ff]" href={`/essays/${essay.slug}`}>Baca essay</Link>
              </div>
              {essay.hasCover ? (
                <Link className="relative aspect-[4/3] overflow-hidden bg-[#f0f0f0]" href={`/essays/${essay.slug}`}>
                  <Image alt={`Sampul ${essay.title}`} className="object-cover transition duration-500 hover:scale-[1.03]" fill sizes="(max-width: 1024px) 100vw, 220px" src={`/api/essay-cover/${essay.id}?v=${new Date(essay.updatedAt).getTime()}`} />
                </Link>
              ) : null}
            </article>
          ))
        )}
      </section>

      <WorksFooter />
    </main>
  );
}
