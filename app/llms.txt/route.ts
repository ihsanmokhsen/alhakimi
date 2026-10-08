import { prisma } from "@/lib/prisma";
import { PERSON_ALTERNATE_NAME, PERSON_NAME, PRIMARY_PAGES, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

/** Ringkasan situs untuk AI agent (llmstxt.org); ISR seperti halaman lain, diperbarui tiap 5 menit. */
export const revalidate = 300;

function oneLine(text: string, max = 220) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const lines: string[] = [
    `# ${PERSON_NAME} — Works`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Tentang pemilik situs",
    `- Nama: ${PERSON_NAME} (${PERSON_ALTERNATE_NAME}, alhakimi, M. I. H. Mokhsen)`,
    "- Pekerjaan: ASN Pranata Komputer, Badan Pendapatan dan Aset Daerah (BPAD) Provinsi Nusa Tenggara Timur, Kupang",
    "- Fokus: Digital Forensics, Information Security Awareness, HAIS-Q, AI, perlindungan data, pengembangan web pemerintahan",
    "- Situs profil utama: https://www.ihsanmokhsen.com/ (ringkasan untuk AI: https://www.ihsanmokhsen.com/llms.txt)",
    "",
    "## Halaman utama",
    ...PRIMARY_PAGES.map((page) => `- [${page.name}](${SITE_URL}${page.path}): ${page.description}`)
  ];

  try {
    const [projects, essays, journals] = await Promise.all([
      prisma.project.findMany({
        select: { title: true, url: true, description: true, category: true },
        orderBy: [{ featured: "desc" }, { position: "asc" }]
      }),
      prisma.essay.findMany({
        select: { title: true, slug: true, excerpt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" }
      }),
      prisma.journal.findMany({
        select: { id: true, title: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 30
      })
    ]);

    if (projects.length > 0) {
      lines.push("", "## Works — aplikasi & proyek");
      for (const project of projects) {
        lines.push(`- [${project.title}](${project.url}) — ${project.category}: ${oneLine(project.description)}`);
      }
    }

    if (essays.length > 0) {
      lines.push("", "## Essays — tulisan panjang");
      for (const essay of essays) {
        lines.push(
          `- [${essay.title}](${SITE_URL}/essays/${encodeURIComponent(essay.slug)}) (${isoDate(essay.publishedAt)}): ${oneLine(essay.excerpt)}`
        );
      }
    }

    if (journals.length > 0) {
      lines.push("", "## Stories — catatan terbaru");
      for (const journal of journals) {
        lines.push(
          `- [${journal.title}](${SITE_URL}/journal/${encodeURIComponent(journal.id)}) (${isoDate(journal.publishedAt)})`
        );
      }
    }
  } catch {
    // Database sementara tidak tersedia: tetap sajikan ringkasan statis di atas.
  }

  lines.push("", "## Lainnya", `- [Sitemap](${SITE_URL}/sitemap.xml)`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
