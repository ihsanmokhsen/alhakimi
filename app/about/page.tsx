import type { Metadata } from "next";

import { MaknaFooter, WorksHeader } from "@/components/portfolio/makna-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tentang Ihsan Mokhsen",
  description:
    "Profil Muhammad Ihsanul Hakim Mokhsen: Pranata Komputer, peneliti forensik digital dan keamanan informasi, publikasi HAIS-Q, serta pengembang layanan digital pemerintahan.",
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
  "Pengembangan dan penyempurnaan HAIS-Q",
  "Kesadaran keamanan siber di lingkungan pemerintahan",
  "Kecerdasan buatan dan perlindungan data"
];

const recentWorkItems = [
  {
    title: "Layanan digital pemerintahan",
    description:
      "Saya mengembangkan pengalaman digital yang membantu pekerjaan pemerintahan menjadi lebih ringkas dan terarah, termasuk Absen Pagi Perbidang serta platform Optimalisasi PAD NTT. Fokus saya bukan hanya membuat aplikasi berjalan, tetapi memastikan alurnya mudah dipahami oleh orang yang menggunakannya setiap hari."
  },
  {
    title: "Produk web dan sistem pengelolaan konten",
    description:
      "Akhir-akhir ini saya membangun dan merawat ekosistem works.ihsanmokhsen.com: portofolio karya, jurnal, esai, video POV, dasbor admin, dan asisten berbasis kecerdasan buatan. Saya mengerjakan prosesnya dari perancangan antarmuka hingga logika aplikasi, basis data, dan pengelolaan konten."
  },
  {
    title: "Kualitas, aksesibilitas, dan jangkauan",
    description:
      "Saya juga sedang memperkuat kualitas produk melalui optimasi performa, mode gelap, kontrol aksesibilitas, struktur SEO, peta situs, Search Console, dan Google Analytics. Tujuannya agar setiap layanan lebih cepat, inklusif, mudah ditemukan, serta dapat dievaluasi menggunakan data."
  },
  {
    title: "Riset keamanan informasi",
    description:
      "Di sisi akademik, saya melanjutkan pekerjaan mengenai kesadaran keamanan informasi melalui HAIS-Q, khususnya dalam konteks institusi pemerintah Indonesia. Perhatian saya tertuju pada perubahan perilaku yang dapat diukur, perlindungan data, dan penggunaan kecerdasan buatan secara bertanggung jawab."
  }
] as const;

const personalDetails = [
  { label: "Peran", value: "Pranata Komputer dan peneliti keamanan informasi" },
  {
    label: "Instansi",
    value: "Badan Pendapatan dan Aset Daerah Provinsi Nusa Tenggara Timur"
  },
  { label: "Bidang", value: "Forensik digital, keamanan informasi, dan pengembangan web" },
  { label: "Pendekatan", value: "Berpusat pada manusia, praktis, terukur, dan berbasis data" }
] as const;

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
        <div className="divide-y divide-[color:var(--border-solid)]">
          <section className="py-12 sm:py-16">
            <p className="mb-8 text-[12px] font-black uppercase text-[color:var(--text)]/36 sm:mb-10">
              Profil diri
            </p>
            <div>
              <p className="text-[13px] font-black uppercase text-[#ff4f0a]">
                Muhammad Ihsanul Hakim Mokhsen, S.Kom., M.S.F
              </p>
              <h2 className="mt-5 max-w-4xl text-[34px] font-black leading-none tracking-tight text-[color:var(--text)] sm:text-[58px]">
                Forensik Digital &amp; Keamanan Informasi
              </h2>
              <div className="mt-8 max-w-4xl space-y-6 text-[16px] font-medium leading-8 text-[color:var(--text)]/60 sm:text-[18px] sm:leading-9">
                <p>
                  Saya adalah Pranata Komputer pada Badan Pendapatan dan Aset Daerah Provinsi Nusa Tenggara Timur.
                  Dalam pekerjaan sehari-hari, saya membantu menerjemahkan kebutuhan organisasi menjadi layanan
                  digital yang lebih efektif, mudah digunakan, dan relevan dengan proses kerja pemerintahan.
                </p>
                <p>
                  Latar belakang saya mencakup ilmu komputer, forensik digital, dan keamanan informasi. Saya menyukai
                  pekerjaan yang menghubungkan riset dengan praktik: membangun aplikasi, merancang pengalaman pengguna,
                  mengelola data, serta membuat konsep keamanan dapat dipahami dan diterapkan oleh lebih banyak orang.
                </p>
                <p>
                  Riset saya berfokus pada kesadaran keamanan informasi melalui Kuesioner Aspek Manusia dalam Keamanan
                  Informasi (HAIS-Q). Bagi saya, keamanan bukan sekadar slogan atau kepatuhan administratif, tetapi
                  kebiasaan yang perlu dibangun, diuji, dan ditingkatkan secara terukur di dalam institusi.
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <p className="mb-8 text-[12px] font-black uppercase text-[color:var(--text)]/36 sm:mb-10">
              Publikasi
            </p>
            <div>
              <h3 className="max-w-4xl text-[30px] font-black leading-tight tracking-tight text-[color:var(--text)] sm:text-[50px]">
                Adaptasi dan Validasi HAIS-Q untuk Mengukur Kesadaran Keamanan Informasi pada Institusi Pemerintah
                Indonesia
              </h3>
              <div className="mt-8 grid gap-5 text-[15px] font-medium leading-7 text-[color:var(--text)]/58 sm:text-[16px] lg:grid-cols-3">
                <p>
                  <span className="block text-[11px] font-black uppercase text-[color:var(--text)]/32">Penulis</span>
                  <span className="mt-2 block text-[color:var(--text)]">M. I. H. Mokhsen dan R. G. Utomo</span>
                </p>
                <p>
                  <span className="block text-[11px] font-black uppercase text-[color:var(--text)]/32">Diterbitkan dalam</span>
                  <span className="mt-2 block text-[color:var(--text)]">
                    Konferensi Internasional IEEE ke-2 tentang Kriptografi, Informatika, dan Keamanan Siber 2025
                    (ICoCICs)
                  </span>
                </p>
                <p>
                  <span className="block text-[11px] font-black uppercase text-[color:var(--text)]/32">Rincian</span>
                  <span className="mt-2 block text-[color:var(--text)]">
                    Halaman 1-6, DOI{" "}
                    <a
                      className="font-black text-[#ff4f0a] transition hover:text-[color:var(--text)]"
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

          <section className="py-12 sm:py-16">
            <p className="mb-8 text-[12px] font-black uppercase text-[color:var(--text)]/36 sm:mb-10">
              Detail singkat
            </p>
            <div className="grid border-t border-[color:var(--border-solid)] sm:grid-cols-2">
              {personalDetails.map((item) => (
                <div
                  className="border-b border-[color:var(--border-solid)] py-6 sm:min-h-40 sm:px-6 sm:py-7 sm:odd:border-r sm:odd:pl-0"
                  key={item.label}
                >
                  <p className="text-[11px] font-black uppercase text-[color:var(--text)]/32">{item.label}</p>
                  <p className="mt-3 max-w-md text-[19px] font-black leading-7 tracking-tight text-[color:var(--text)] sm:text-[23px] sm:leading-8">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <p className="mb-8 text-[12px] font-black uppercase text-[color:var(--text)]/36 sm:mb-10">
              Belakangan ini
            </p>
            <div className="divide-y divide-[color:var(--border-solid)] border-y border-[color:var(--border-solid)]">
              {recentWorkItems.map((item, index) => (
                <article className="grid gap-4 py-7 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-9" key={item.title}>
                  <p className="text-[12px] font-black text-[#ff4f0a]">0{index + 1}</p>
                  <div>
                    <h2 className="text-[28px] font-black leading-none tracking-tight text-[color:var(--text)] sm:text-[42px]">
                      {item.title}
                    </h2>
                    <p className="mt-4 max-w-3xl text-[16px] font-medium leading-8 text-[color:var(--text)]/60 sm:text-[18px] sm:leading-9">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <p className="mb-8 text-[12px] font-black uppercase text-[color:var(--text)]/36 sm:mb-10">
              Fokus saat ini
            </p>
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

          <section className="py-12 sm:py-16">
            <p className="mb-8 text-[12px] font-black uppercase text-[color:var(--text)]/36 sm:mb-10">
              Hubungi saya
            </p>
            <div className="flex flex-col gap-4 text-[26px] font-black leading-none tracking-tight text-[color:var(--text)] sm:text-[42px]">
              {contactLinks.map((item) => (
                <a
                  className="w-fit transition hover:text-[#ff4f0a]"
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
