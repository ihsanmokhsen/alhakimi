import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader active="about" />

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <p className="text-[12px] font-black uppercase text-[#2563ff]">About</p>
          <h1 className="mt-5 text-[clamp(3.9rem,9vw,8rem)] font-black leading-[0.86] tracking-normal text-black">
            Calm systems for meaningful work.
          </h1>
        </div>

        <div className="space-y-5">
          <section className="rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_24px_90px_rgba(18,22,34,0.10)] sm:p-8 lg:p-10">
            <p className="text-[12px] font-black uppercase text-[#2563ff]">Muhammad Ihsanul Hakim Mokhsen</p>
            <h2 className="mt-5 text-[34px] font-black leading-none tracking-normal text-black sm:text-[52px]">
              Creative public-sector technology, built with clarity.
            </h2>
            <div className="mt-8 space-y-6 text-[16px] font-medium leading-8 text-black/60 sm:text-[18px] sm:leading-9">
              <p>
                As a civil servant at the Regional Revenue and Asset Agency of East Nusa Tenggara Province, I actively
                develop simple web-based applications to support operational activities and improve workflow efficiency
                within the institution.
              </p>
              <p>
                I focus on building web applications that are clean, fast to use, and visually clear. This page provides
                a brief introduction, outlines my working approach, and highlights the main ideas behind the projects
                featured in this portfolio.
              </p>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_18px_60px_rgba(18,22,34,0.08)]">
              <p className="text-[12px] font-black uppercase text-black/36">Location</p>
              <p className="mt-4 text-[28px] font-black leading-none text-black">Kupang</p>
            </div>
            <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_18px_60px_rgba(18,22,34,0.08)]">
              <p className="text-[12px] font-black uppercase text-black/36">Focus</p>
              <p className="mt-4 text-[28px] font-black leading-none text-black">Products and data</p>
            </div>
          </section>
        </div>
      </section>

      <MaknaFooter />
    </main>
  );
}
