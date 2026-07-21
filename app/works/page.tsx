import type { Metadata } from "next";

import { WorksFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { StructuredData } from "@/components/seo/structured-data";
import { getProjects } from "@/lib/data/projects";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Works — Aplikasi & Karya Digital",
  description:
    "Jelajahi aplikasi, website, prototipe, dan karya digital pilihan yang dibuat oleh Muhammad Ihsanul Hakim Mokhsen.",
  alternates: { canonical: "/works" },
  openGraph: {
    title: "Works — Aplikasi & Karya Digital Ihsan Mokhsen",
    description:
      "Kumpulan aplikasi, website, prototipe, dan karya digital pilihan Ihsan Mokhsen.",
    url: "/works",
    type: "website"
  }
};

export default async function WorksPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface)] text-[color:var(--text)]">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Beranda", path: "/" },
          { name: "Works", path: "/works" }
        ])}
      />
      <WorksHeader active="works" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <p className="text-[12px] font-black uppercase text-[#ff4f0a]">Works</p>
        <h1 className="mt-5 max-w-5xl text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.9] tracking-normal text-[color:var(--text)]">
          Aplikasi dan karya digital.
        </h1>
        <p className="mt-8 max-w-3xl text-[18px] font-medium leading-8 text-[color:var(--text)]/58 sm:text-[21px]">
          Website, aplikasi internal, prototipe, dan eksperimen digital yang dibuat oleh Muhammad Ihsanul Hakim
          Mokhsen untuk kebutuhan pemerintahan, riset, bisnis, dan proyek pribadi.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <PortfolioGrid projects={projects} />
      </section>

      <WorksFooter />
    </main>
  );
}
