import type { Metadata } from "next";

import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { getPovVideos } from "@/lib/data/pov-videos";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "POV — Video Keseharian",
  description: "POV Ihsan Mokhsen: video vertikal singkat yang mendokumentasikan keseharian, perjalanan, dan momen kreatif.",
  alternates: { canonical: "/pov" },
  openGraph: {
    title: "POV — Video Keseharian Ihsan Mokhsen",
    description: "Video singkat tentang keseharian, perjalanan, dan momen kreatif Ihsan Mokhsen.",
    url: "/pov",
    type: "website"
  }
};

export default async function PovPage() {
  const videos = await getPovVideos();

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white [color-scheme:dark]">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "POV", path: "/pov" }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": `${SITE_URL}/pov#collection`,
            url: `${SITE_URL}/pov`,
            name: "POV — Video Keseharian Ihsan Mokhsen",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            author: { "@id": `${SITE_URL}/#person` },
            inLanguage: "id-ID"
          }
        ]}
      />
      <WorksHeader active="pov" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-[12px] font-black uppercase text-[#2563ff]">POV</p>
          <h1 className="mt-5 text-[clamp(3.8rem,10vw,8.5rem)] font-black leading-[0.86] tracking-tight text-white">
            documenting my boring life.
          </h1>
          <p className="mt-8 max-w-2xl text-[17px] font-medium leading-8 text-white/58 sm:text-[20px]">
            Short vertical videos. Scroll down to watch.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {videos.length === 0 ? (
          <div className="rounded-[24px] border border-[color:var(--border-solid)] bg-[color:var(--surface)]/[0.04] p-10 text-center">
            <p className="text-[15px] font-bold text-white/50">No videos yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <article className="w-full space-y-3" key={video.id}>
                <div
                  className="relative w-full overflow-hidden rounded-[20px] border border-[color:var(--border-solid)] bg-[color:var(--surface)]/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  style={{ aspectRatio: "9 / 16" }}
                >
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    src={video.youtubeUrl}
                    title={video.title}
                  />
                </div>
                <p className="px-1 text-[14px] font-bold text-white/70">{video.title}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <WorksFooter />
    </main>
  );
}
