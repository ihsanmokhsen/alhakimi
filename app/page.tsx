import { HomeShell } from "@/components/portfolio/home-shell";
import { getProjects } from "@/lib/data/projects";

/** Hindari query DB saat `next build` bila .env belum mengarah ke Supabase. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjects();

  return <HomeShell projects={projects} />;
}
