import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/works", changeFrequency: "weekly", priority: 0.9 },
    { path: "/journal", changeFrequency: "weekly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pov", changeFrequency: "weekly", priority: 0.8 }
  ] as const;

  const routes: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority
  }));

  try {
    const journals = await prisma.journal.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { publishedAt: "desc" }
    });

    routes.push(
      ...journals.map((journal) => ({
        url: `${SITE_URL}/journal/${encodeURIComponent(journal.id)}`,
        lastModified: journal.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7
      }))
    );
  } catch {
    // Keep core pages discoverable if the database is temporarily unavailable.
  }

  return routes;
}
