import type { Metadata } from "next";

import { MaknaFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tentang Ihsan Mokhsen",
  description:
    "Profil Muhammad Ihsanul Hakim Mokhsen: Pranata Komputer, peneliti Digital Forensics & Information Security, publikasi HAIS-Q, dan fokus keamanan siber.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Tentang Muhammad Ihsanul Hakim Mokhsen",
    description:
      "Profil, riset, publikasi, dan fokus profesional Ihsan Mokhsen dalam keamanan informasi.",
    url: "/about",
    type: "profile"
  }
};

const focusItems = [
  "Thesis: Improving HAIS-Q",
  "Government cybersecurity awareness",
  "AI and data protection"
];

const contactLinks = [
  { href: "https://www.linkedin.com/in/ihsanmokhsen/", label: "linkedin.com/in/ihsanmokhsen" },
  { href: "https://github.com/ihsanmokhsen", label: "github.com/ihsanmokhsen" },
  { href: "https://www.ihsanmokhsen.com/", label: "ihsanmokhsen.com" }
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Tentang", path: "/about" }
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": `${SITE_URL}/about#profile`,
            url: `${SITE_URL}/about`,
            name: "Tentang Muhammad Ihsanul Hakim Mokhsen",
            mainEntity: { "@id": `${SITE_URL}/#person` },
            inLanguage: "id-ID"
          },
          {
            "@context": "https://schema.org",
            "@type": "ScholarlyArticle",
            headline:
              "Adaptation and Validation of HAIS-Q for Measuring Information Security Awareness in Indonesian Government Institutions",
            author: [
              { "@id": `${SITE_URL}/#person` },
              { "@type": "Person", name: "Rio Guntur Utomo" }
            ],
            datePublished: "2025",
            identifier: "https://doi.org/10.1109/ICoCICs68032.2025.11383985",
            sameAs: "https://doi.org/10.1109/ICoCICs68032.2025.11383985",
            isPartOf: {
              "@type": "PublicationIssue",
              name: "2025 IEEE 2nd International Conference on Cryptography, Informatics, and Cybersecurity (ICoCICs)"
            }
          }
        ]}
      />
      <WorksHeader active="about" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-14 sm:px-6 sm:pt-24 lg:px-8">
        <div className="border-b border-[color:var(--border-solid)] pb-12 sm:pb-16 lg:pb-20">
          <p className="text-[12px] font-black uppercase text-[#2563ff]">About</p>
          <h1 className="mt-5 max-w-5xl text-[clamp(3.15rem,8vw,7.5rem)] font-black leading-[0.88] tracking-tight text-[color:var(--text)]">
            Security awareness, made practical.
          </h1>
          <p className="mt-8 max-w-3xl text-[20px] font-semibold leading-8 text-[color:var(--text)]/54 sm:text-[28px] sm:leading-10">
            Government IT practitioner and graduate researcher building practical security awareness and
            human-centered cyber resilience across institutions.
          </p>
        </div>

        <div className="divide-y divide-[color:var(--border-solid)]">
          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-black uppercase text-[color:var(--text)]/36">Profile</p>
            </div>
            <div>
              <p className="text-[13px] font-black uppercase text-[#2563ff]">
                Muhammad Ihsanul Hakim Mokhsen, S.Kom., M.S.F
              </p>
              <h2 className="mt-5 max-w-4xl text-[34px] font-black leading-none tracking-tight text-[color:var(--text)] sm:text-[58px]">
                Digital Forensics &amp; Information Security
              </h2>
              <div className="mt-8 max-w-4xl space-y-6 text-[16px] font-medium leading-8 text-[color:var(--text)]/60 sm:text-[18px] sm:leading-9">
                <p>
                  My work sits between public-sector technology, digital forensics, information security awareness, and
                  behavioral security measurement.
                </p>
                <p>
                  I focus on turning cybersecurity concepts into tools, research, and workflows that can be understood,
                  adopted, and measured inside government institutions.
                </p>
                <p>
                  As a Digital Forensics graduate student, my research explores Information Security Awareness through
                  HAIS-Q, with an emphasis on measurable behavioral improvement rather than awareness as a slogan.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-black uppercase text-[color:var(--text)]/36">Publication</p>
            </div>
            <div>
              <h3 className="max-w-4xl text-[30px] font-black leading-tight tracking-tight text-[color:var(--text)] sm:text-[50px]">
                Adaptation and Validation of HAIS-Q for Measuring Information Security Awareness in Indonesian
                Government Institutions
              </h3>
              <div className="mt-8 grid gap-5 text-[15px] font-medium leading-7 text-[color:var(--text)]/58 sm:text-[16px] lg:grid-cols-3">
                <p>
                  <span className="block text-[11px] font-black uppercase text-[color:var(--text)]/32">Authors</span>
                  <span className="mt-2 block text-[color:var(--text)]">M. I. H. Mokhsen and R. G. Utomo</span>
                </p>
                <p>
                  <span className="block text-[11px] font-black uppercase text-[color:var(--text)]/32">Published in</span>
                  <span className="mt-2 block text-[color:var(--text)]">
                    2025 IEEE 2nd International Conference on Cryptography, Informatics, and Cybersecurity (ICoCICs)
                  </span>
                </p>
                <p>
                  <span className="block text-[11px] font-black uppercase text-[color:var(--text)]/32">Details</span>
                  <span className="mt-2 block text-[color:var(--text)]">
                    Pages 1-6, DOI{" "}
                    <a
                      className="font-black text-[#2563ff] transition hover:text-[color:var(--text)]"
                      href="https://doi.org/10.1109/ICoCICs68032.2025.11383985"
                      rel="noreferrer"
                      target="_blank"
                    >
                      10.1109/ICoCICs68032.2025.11383985
                    </a>
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-black uppercase text-[color:var(--text)]/36">Current focus</p>
            </div>
            <div className="divide-y divide-[color:var(--border-solid)] border-y border-[color:var(--border-solid)]">
              {focusItems.map((item) => (
                <p
                  className="py-5 text-[28px] font-black leading-none tracking-tight text-[color:var(--text)] sm:py-7 sm:text-[44px]"
                  key={item}
                >
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-black uppercase text-[color:var(--text)]/36">Contact</p>
            </div>
            <div className="flex flex-col gap-4 text-[26px] font-black leading-none tracking-tight text-[color:var(--text)] sm:text-[42px]">
              {contactLinks.map((item) => (
                <a
                  className="w-fit transition hover:text-[#2563ff]"
                  href={item.href}
                  key={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>

      <MaknaFooter />
    </main>
  );
}
