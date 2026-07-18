import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { getEssayBySlug } from "@/lib/data/essays";
import { splitEssayContent, stripEssayImageMarkers } from "@/lib/essay-content";
import { absoluteUrl, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { formatJournalDate } from "@/lib/utils";

type EssayPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const essay = await getEssayBySlug((await params).slug);
  if (!essay) return { title: "Essay tidak ditemukan", robots: { index: false, follow: false } };

  const path = `/essays/${essay.slug}`;
  const image = essay.hasCover ? `/api/essay-cover/${essay.id}` : "/hero.jpg";
  return {
    title: essay.title,
    description: essay.excerpt,
    alternates: { canonical: path },
    openGraph: {
      title: essay.title,
      description: essay.excerpt,
      url: path,
      type: "article",
      publishedTime: essay.publishedAt.toISOString(),
      modifiedTime: essay.updatedAt.toISOString(),
      authors: ["Muhammad Ihsanul Hakim Mokhsen"],
      images: [{ url: image, alt: essay.title }]
    }
  };
}

export default async function EssayPage({ params }: EssayPageProps) {
  const essay = await getEssayBySlug((await params).slug);
  if (!essay) notFound();

  const path = `/essays/${essay.slug}`;
  const url = absoluteUrl(path);
  const plainContent = stripEssayImageMarkers(essay.content);
  const readingMinutes = Math.max(1, Math.ceil(plainContent.split(/\s+/).length / 220));
  const inlineImageByToken = new Map(essay.inlineImages.map((image) => [image.token, image]));

  return (
    <main className="min-h-screen bg-white text-[#111113]">
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Beranda", path: "/" }, { name: "Essays", path: "/essays" }, { name: essay.title, path }]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url}#article`,
          headline: essay.title,
          description: essay.excerpt,
          articleBody: plainContent,
          datePublished: essay.publishedAt.toISOString(),
          dateModified: essay.updatedAt.toISOString(),
          author: { "@id": `${SITE_URL}/#person` },
          publisher: { "@id": `${SITE_URL}/#person` },
          image: absoluteUrl(essay.hasCover ? `/api/essay-cover/${essay.id}` : "/hero.jpg"),
          mainEntityOfPage: url,
          inLanguage: "id-ID"
        }
      ]} />
      <WorksHeader active="essays" />

      <article>
        <header className="mx-auto w-full max-w-5xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
          <Link className="text-[12px] font-black uppercase text-[#2563ff]" href="/essays">Essays</Link>
          <h1 className="mt-6 max-w-5xl text-[clamp(3rem,8vw,7rem)] font-black leading-[0.9] tracking-normal">{essay.title}</h1>
          <p className="mt-7 max-w-3xl text-[18px] font-medium leading-8 text-black/55 sm:text-[22px] sm:leading-9">{essay.excerpt}</p>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/12 pt-5 text-[12px] font-bold uppercase text-black/42">
            <span>{formatJournalDate(essay.publishedAt)}</span>
            <span>{readingMinutes} menit membaca</span>
            <span>Ihsan Mokhsen</span>
          </div>
        </header>

        {essay.hasCover ? (
          <div className="relative mx-auto aspect-[16/8] w-full max-w-7xl overflow-hidden bg-[#f0f0f0]">
            <Image alt={`Sampul ${essay.title}`} className="object-cover" fill priority sizes="100vw" src={`/api/essay-cover/${essay.id}?v=${new Date(essay.updatedAt).getTime()}`} />
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-[760px] px-4 py-14 sm:px-6 sm:py-20">
          <div className="space-y-7">
            {splitEssayContent(essay.content).map((block, blockIndex) => {
              if (block.type === "image") {
                const image = inlineImageByToken.get(block.token);
                if (!image) return null;

                return (
                  <figure className="py-3" key={`image-${image.id}-${blockIndex}`}>
                    <Image
                      alt={image.alt}
                      className="h-auto w-full bg-[#f0f0f0] object-contain"
                      height={image.height}
                      sizes="(max-width: 760px) 100vw, 760px"
                      src={`/api/essay-image/${image.id}`}
                      width={image.width}
                    />
                  </figure>
                );
              }

              return block.text.split(/\n\s*\n/).filter(Boolean).map((paragraph, paragraphIndex) => (
                <p className="whitespace-pre-line text-[17px] font-medium leading-8 text-black/72 sm:text-[19px] sm:leading-9" key={`text-${blockIndex}-${paragraphIndex}`}>{paragraph.trim()}</p>
              ));
            })}
          </div>
          <div className="mt-16 border-t border-black/12 pt-8">
            <Link className="inline-flex border-b-2 border-black pb-1 text-[12px] font-black uppercase hover:border-[#2563ff] hover:text-[#2563ff]" href="/essays">Lihat semua essays</Link>
          </div>
        </div>
      </article>

      <WorksFooter />
    </main>
  );
}
