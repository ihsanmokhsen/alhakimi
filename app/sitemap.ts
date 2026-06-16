import type { MetadataRoute } from "next";

const BASE_URL = "https://works.ihsanmokhsen.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/about", "/journal", "/pov"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8
  }));

  return routes;
}
