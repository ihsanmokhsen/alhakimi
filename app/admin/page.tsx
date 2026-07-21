import Image from "next/image";
import Link from "next/link";

import { HeroForm } from "@/components/admin/hero-form";
import { EssayForm } from "@/components/admin/essay-form";
import { EssayList } from "@/components/admin/essay-list";
import { JournalForm } from "@/components/admin/journal-form";
import { JournalList } from "@/components/admin/journal-list";
import { PovVideoForm } from "@/components/admin/pov-video-form";
import { PovVideoList } from "@/components/admin/pov-video-list";
import { ProjectList } from "@/components/admin/project-list";
import { createJournalAction } from "@/lib/actions/journals";
import { createEssayAction } from "@/lib/actions/essays";
import { createPovVideoAction } from "@/lib/actions/pov-videos";
import { logoutAction } from "@/lib/actions/auth";
import { removeHeroAction, updateHeroAction } from "@/lib/actions/hero";
import { removeWelcomeAction, updateWelcomeAction } from "@/lib/actions/welcome";
import { reorderProjectsAction } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth";
import { getJournals } from "@/lib/data/journals";
import { getEssays } from "@/lib/data/essays";
import { getPovVideos } from "@/lib/data/pov-videos";
import { getProjects } from "@/lib/data/projects";
import { getSiteVisitCount } from "@/lib/data/site-visits";
import { prisma } from "@/lib/prisma";

const dashboardLinks = [
  { href: "#home", label: "Beranda" },
  { href: "#stories", label: "Stories" },
  { href: "#essays", label: "Essays" },
  { href: "#works", label: "Works" },
  { href: "#appearance", label: "Tampilan" },
  { href: "#pov", label: "POV" }
] as const;

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="min-w-0 border-r border-[color:var(--border-solid)] pr-4 last:border-r-0 last:pr-0">
      <p className="text-[24px] font-black leading-none text-[color:var(--text)] sm:text-[30px]">{value}</p>
      <p className="mt-2 truncate text-[11px] font-bold uppercase text-[color:var(--text)]/40">{label}</p>
    </div>
  );
}

export default async function AdminPage() {
  const admin = await requireAdmin();
  const projects = await getProjects();
  const journals = await getJournals();
  const essays = await getEssays();
  const povVideos = await getPovVideos();
  const visitCount = await getSiteVisitCount().catch((error) => {
    console.error("Failed to load website visit count", error);
    return 0;
  });
  const heroSetting = await prisma.siteSetting.findUnique({
    where: { id: "hero" },
    select: { backgroundImageData: true, heroTitle: true, heroSubtitle: true, welcomeImageData: true }
  });
  const hasHero = Boolean(heroSetting?.backgroundImageData);
  const currentTitle = heroSetting?.heroTitle ?? "";
  const currentSubtitle = heroSetting?.heroSubtitle ?? "";
  const hasWelcome = Boolean(heroSetting?.welcomeImageData);

  return (
    <main className="min-h-screen bg-[color:var(--surface-muted)] text-[color:var(--text)]">
      <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link className="shrink-0 text-[20px] font-black leading-none" href="/">
              works
            </Link>
            <span className="hidden h-6 w-px bg-[color:var(--border-solid)] sm:block" />
            <p className="hidden truncate text-[13px] font-bold text-[color:var(--text)]/48 sm:block">
              Dashboard
            </p>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Dashboard navigation">
            {dashboardLinks.map((item) => (
              <a
                className="px-4 py-2 text-[12px] font-bold text-[color:var(--text)]/52 transition hover:bg-[color:var(--bg-chip)] hover:text-[color:var(--text)]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              className="hidden border border-[color:var(--border-solid)] bg-[color:var(--surface)] px-4 py-2 text-[12px] font-black transition hover:border-[#2563ff]/30 hover:text-[#2563ff] sm:inline-flex"
              href="/"
              target="_blank"
            >
              Lihat situs
            </Link>
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface-muted)] sm:h-10 sm:w-10">
              <Image alt={admin.username} className="object-cover" fill sizes="40px" src="/foto.png" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[220px_minmax(0,760px)_260px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="flex items-center gap-3 px-2">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[color:var(--border-solid)] bg-[color:var(--surface)]">
                <Image alt={admin.username} className="object-cover" fill sizes="44px" src="/foto.png" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-black">{admin.username}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-[color:var(--text)]/40">Administrator</p>
              </div>
            </div>

            <nav className="space-y-1" aria-label="Management sections">
              {dashboardLinks.map((item, index) => (
                <a
                  className={`flex min-h-11 items-center gap-3 px-3 text-[13px] font-bold transition hover:bg-[color:var(--surface)] ${
                    index === 0 ? "bg-[color:var(--surface)] text-[#2563ff] shadow-[0_10px_35px_rgba(18,22,34,0.06)]" : "text-[color:var(--text)]/60"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--bg-chip)] text-[11px] font-black">
                    {item.label.slice(0, 1)}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="border-t border-[color:var(--border-solid)] pt-4">
              <Link
                className="flex min-h-11 items-center px-3 text-[13px] font-bold text-[color:var(--text)]/60 transition hover:bg-[color:var(--surface)] hover:text-[#2563ff]"
                href="/admin/new"
              >
                Tambah project
              </Link>
              <form action={logoutAction}>
                <button
                  className="flex min-h-11 w-full items-center px-3 text-left text-[13px] font-bold text-red-500 transition hover:bg-red-500/5"
                  type="submit"
                >
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-8">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Mobile dashboard navigation">
            {dashboardLinks.map((item, index) => (
              <a
                className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold ${
                  index === 0
                    ? "border-[#2563ff] bg-[#2563ff] text-white"
                    : "border-[color:var(--border-solid)] bg-[color:var(--surface)] text-[color:var(--text)]/60"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <section
            className="scroll-mt-24 overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_18px_60px_rgba(18,22,34,0.07)]"
            id="home"
          >
            <div className="relative min-h-48 overflow-hidden bg-[url('/api/hero-image')] bg-cover bg-center p-5 sm:min-h-56 sm:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.22))]" />
              <div className="relative flex min-h-38 max-w-xl flex-col justify-end text-white sm:min-h-42">
                <p className="text-[11px] font-black uppercase text-white/60">Dashboard beranda</p>
                <h1 className="mt-2 text-[32px] font-black leading-none sm:text-[44px]">
                  Selamat datang, {admin.username}.
                </h1>
                <p className="mt-3 max-w-lg text-[13px] font-medium leading-6 text-white/72 sm:text-[14px]">
                  Kelola semua yang tampil di works tanpa meninggalkan suasana halaman depan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-5 sm:p-6">
              <StatCard label="Kunjungan" value={visitCount} />
              <StatCard label="Works" value={projects.length} />
              <StatCard label="Stories" value={journals.length} />
              <StatCard label="Essays" value={essays.length} />
              <StatCard label="POV" value={povVideos.length} />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[color:var(--border)] p-4 sm:px-6">
              <a className="bg-[#2563ff] px-4 py-2.5 text-[12px] font-black text-white transition hover:bg-[#0f4ff2]" href="#stories">
                Buat story
              </a>
              <a className="border border-[color:var(--border-solid)] px-4 py-2.5 text-[12px] font-black text-[color:var(--text)]/60" href="#essays">
                Tulis essay
              </a>
              <Link className="bg-[color:var(--inverse-surface)] px-4 py-2.5 text-[12px] font-black text-[color:var(--inverse-text)]" href="/admin/new">
                Tambah project
              </Link>
              <a className="border border-[color:var(--border-solid)] px-4 py-2.5 text-[12px] font-black text-[color:var(--text)]/60" href="#appearance">
                Atur tampilan
              </a>
              <form action={logoutAction} className="ml-auto lg:hidden">
                <button className="px-3 py-2.5 text-[12px] font-black text-red-500" type="submit">
                  Keluar
                </button>
              </form>
            </div>
          </section>

          <section className="scroll-mt-24 space-y-4" id="stories">
            <div>
              <p className="text-[11px] font-black uppercase text-[#2563ff]">Buat postingan</p>
              <h2 className="mt-2 text-[30px] font-black leading-none sm:text-[38px]">Stories</h2>
              <p className="mt-2 text-[13px] font-medium leading-6 text-[color:var(--text)]/48">
                Tulis pembaruan seperti membuat postingan di beranda.
              </p>
            </div>
            <JournalForm action={createJournalAction} />
            <JournalList journals={journals} />
          </section>

          <section className="scroll-mt-24 space-y-4 border-t border-[color:var(--border-solid)] pt-8" id="essays">
            <div>
              <p className="text-[11px] font-black uppercase text-[#2563ff]">Tulisan panjang</p>
              <h2 className="mt-2 text-[30px] font-black leading-none sm:text-[38px]">Essays</h2>
              <p className="mt-2 text-[13px] font-medium leading-6 text-[color:var(--text)]/48">
                Terbitkan pemikiran serius dengan ringkasan, sampul, dan halaman baca tersendiri.
              </p>
            </div>
            <EssayForm action={createEssayAction} />
            <EssayList essays={essays} />
          </section>

          <section className="scroll-mt-24 space-y-4 border-t border-[color:var(--border-solid)] pt-8" id="works">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase text-[#2563ff]">Koleksi</p>
                <h2 className="mt-2 text-[30px] font-black leading-none sm:text-[38px]">Works</h2>
                <p className="mt-2 text-[13px] font-medium leading-6 text-[color:var(--text)]/48">
                  Susun ulang, edit, atau hapus project yang tampil di halaman depan.
                </p>
              </div>
              <Link
                className="inline-flex w-fit bg-[color:var(--inverse-surface)] px-4 py-2.5 text-[12px] font-black text-[color:var(--inverse-text)]"
                href="/admin/new"
              >
                Tambah project
              </Link>
            </div>
            <ProjectList onReorder={reorderProjectsAction} projects={projects} />
          </section>

          <section className="scroll-mt-24 space-y-4 border-t border-[color:var(--border-solid)] pt-8" id="appearance">
            <div>
              <p className="text-[11px] font-black uppercase text-[#2563ff]">Halaman depan</p>
              <h2 className="mt-2 text-[30px] font-black leading-none sm:text-[38px]">Tampilan</h2>
              <p className="mt-2 text-[13px] font-medium leading-6 text-[color:var(--text)]/48">
                Perbarui hero dan welcome popup dari dashboard yang sama.
              </p>
            </div>
            <HeroForm
              currentSubtitle={currentSubtitle}
              currentTitle={currentTitle}
              hasHero={hasHero}
              hasWelcome={hasWelcome}
              removeAction={removeHeroAction}
              updateAction={updateHeroAction}
              welcomeRemoveAction={removeWelcomeAction}
              welcomeUpdateAction={updateWelcomeAction}
            />
          </section>

          <section className="scroll-mt-24 space-y-4 border-t border-[color:var(--border-solid)] pt-8" id="pov">
            <div>
              <p className="text-[11px] font-black uppercase text-[#2563ff]">Video singkat</p>
              <h2 className="mt-2 text-[30px] font-black leading-none sm:text-[38px]">POV</h2>
              <p className="mt-2 text-[13px] font-medium leading-6 text-[color:var(--text)]/48">
                Tambahkan video vertikal dan kelola urutan konten POV.
              </p>
            </div>
            <PovVideoForm action={createPovVideoAction} />
            <PovVideoList videos={povVideos} />
          </section>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <section className="border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_16px_50px_rgba(18,22,34,0.06)]">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[color:var(--border-solid)]">
                  <Image alt={admin.username} className="object-cover" fill sizes="48px" src="/foto.png" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-black">{admin.username}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#2563ff]">Online sebagai admin</p>
                </div>
              </div>
              <p className="mt-4 border-t border-[color:var(--border)] pt-4 text-[12px] font-medium leading-5 text-[color:var(--text)]/48">
                Perubahan yang disimpan langsung muncul di halaman publik.
              </p>
            </section>

            <section className="border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_16px_50px_rgba(18,22,34,0.06)]">
              <p className="text-[11px] font-black uppercase text-[color:var(--text)]/36">Status konten</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-[color:var(--text)]/58">Hero image</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${hasHero ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {hasHero ? "Aktif" : "Belum ada"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold text-[color:var(--text)]/58">Welcome popup</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${hasWelcome ? "bg-emerald-500/10 text-emerald-600" : "bg-[color:var(--bg-chip)] text-[color:var(--text)]/42"}`}>
                    {hasWelcome ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </section>

            <section className="border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_16px_50px_rgba(18,22,34,0.06)]">
              <p className="text-[11px] font-black uppercase text-[color:var(--text)]/36">Akses cepat</p>
              <div className="mt-3 flex flex-col">
                <Link className="border-b border-[color:var(--border)] py-3 text-[12px] font-bold hover:text-[#2563ff]" href="/">
                  Buka beranda publik
                </Link>
                <Link className="border-b border-[color:var(--border)] py-3 text-[12px] font-bold hover:text-[#2563ff]" href="/journal">
                  Buka halaman stories
                </Link>
                <Link className="border-b border-[color:var(--border)] py-3 text-[12px] font-bold hover:text-[#2563ff]" href="/essays">
                  Buka halaman essays
                </Link>
                <Link className="py-3 text-[12px] font-bold hover:text-[#2563ff]" href="/pov">
                  Buka halaman POV
                </Link>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
