import { HomeShell } from "@/components/portfolio/home-shell";
import { PopupAnnouncement } from "@/components/portfolio/popup-announcement";
import { fetchForPrerender } from "@/lib/data/build-safe";
import { getProjects } from "@/lib/data/projects";
import { prisma } from "@/lib/prisma";

/** Halaman statis + ISR; diperbarui oleh revalidatePath saat admin mengedit. */
export const revalidate = 300;

export default async function HomePage() {
  const [projects, heroSetting] = await Promise.all([
    fetchForPrerender(getProjects, []),
    fetchForPrerender(
      () =>
        prisma.siteSetting.findUnique({
          where: { id: "hero" },
          select: { heroTitle: true, heroSubtitle: true, updatedAt: true }
        }),
      null
    )
  ]);

  return (
    <>
      <PopupAnnouncement welcomeVersion={heroSetting?.updatedAt.getTime()} />
      <HomeShell
        heroImageVersion={heroSetting?.updatedAt.getTime()}
        heroSubtitle={heroSetting?.heroSubtitle}
        heroTitle={heroSetting?.heroTitle}
        projects={projects}
      />
    </>
  );
}
