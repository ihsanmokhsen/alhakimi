import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"]
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Google-Extended",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-SearchBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Applebot-Extended",
          "meta-externalagent",
          "Amazonbot",
          "DuckAssistBot",
          "MistralAI-User",
          "CCBot"
        ],
        allow: "/",
        disallow: ["/admin", "/api/"]
      }
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
