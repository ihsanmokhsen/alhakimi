import { MaknaFooter, MaknaHeader } from "@/components/portfolio/makna-shell";

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
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#08080a] [color-scheme:light]">
      <MaknaHeader active="about" />

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-14 sm:px-6 sm:pt-24 lg:px-8">
        <div className="border-b border-black/10 pb-12 sm:pb-16 lg:pb-20">
          <p className="text-[12px] font-black uppercase tracking-normal text-[#2563ff]">About</p>
          <h1 className="mt-5 max-w-5xl text-[clamp(3.15rem,8vw,7.5rem)] font-black leading-[0.88] tracking-normal text-black">
            Security awareness, made practical.
          </h1>
          <p className="mt-8 max-w-3xl text-[20px] font-semibold leading-8 text-black/54 sm:text-[28px] sm:leading-10">
            Government IT practitioner and graduate researcher building practical security awareness and
            human-centered cyber resilience across institutions.
          </p>
        </div>

        <div className="divide-y divide-black/10">
          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-black uppercase tracking-normal text-black/36">Profile</p>
            </div>
            <div>
              <p className="text-[13px] font-black uppercase tracking-normal text-[#2563ff]">
                Muhammad Ihsanul Hakim Mokhsen, S.Kom., M.S.F
              </p>
              <h2 className="mt-5 max-w-4xl text-[34px] font-black leading-none tracking-normal text-black sm:text-[58px]">
                Digital Forensics &amp; Information Security
              </h2>
              <div className="mt-8 max-w-4xl space-y-6 text-[16px] font-medium leading-8 text-black/60 sm:text-[18px] sm:leading-9">
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
              <p className="text-[12px] font-black uppercase tracking-normal text-black/36">Publication</p>
            </div>
            <div>
              <h3 className="max-w-4xl text-[30px] font-black leading-tight text-black sm:text-[50px]">
                Adaptation and Validation of HAIS-Q for Measuring Information Security Awareness in Indonesian
                Government Institutions
              </h3>
              <div className="mt-8 grid gap-5 text-[15px] font-medium leading-7 text-black/58 sm:text-[16px] lg:grid-cols-3">
                <p>
                  <span className="block text-[11px] font-black uppercase text-black/32">Authors</span>
                  <span className="mt-2 block text-black">M. I. H. Mokhsen and R. G. Utomo</span>
                </p>
                <p>
                  <span className="block text-[11px] font-black uppercase text-black/32">Published in</span>
                  <span className="mt-2 block text-black">
                    2025 IEEE 2nd International Conference on Cryptography, Informatics, and Cybersecurity (ICoCICs)
                  </span>
                </p>
                <p>
                  <span className="block text-[11px] font-black uppercase text-black/32">Details</span>
                  <span className="mt-2 block text-black">
                    Pages 1-6, DOI{" "}
                    <a
                      className="font-black text-[#2563ff] transition hover:text-black"
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
              <p className="text-[12px] font-black uppercase tracking-normal text-black/36">Current focus</p>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {focusItems.map((item) => (
                <p
                  className="py-5 text-[28px] font-black leading-none text-black sm:py-7 sm:text-[44px]"
                  key={item}
                >
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.42fr_1fr] lg:gap-14">
            <div>
              <p className="text-[12px] font-black uppercase tracking-normal text-black/36">Contact</p>
            </div>
            <div className="flex flex-col gap-4 text-[26px] font-black leading-none text-black sm:text-[42px]">
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
