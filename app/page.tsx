import { HomeShell } from "@/components/portfolio/home-shell";
import { getProjects } from "@/lib/data/projects";
import { prisma } from "@/lib/prisma";

/** Hindari query DB saat `next build` bila .env belum mengarah ke Supabase. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, heroSetting] = await Promise.all([
    getProjects(),
    prisma.siteSetting.findUnique({
      where: { id: "hero" },
      select: { heroTitle: true, heroSubtitle: true }
    })
  ]);

  return (
    <HomeShell
      heroSubtitle={heroSetting?.heroSubtitle}
      heroTitle={heroSetting?.heroTitle}
      projects={projects}
    />
  );
}
