import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { unstable_cache } from "next/cache";

import { getEssays } from "@/lib/data/essays";
import { getJournals } from "@/lib/data/journals";
import { getPovVideos } from "@/lib/data/pov-videos";
import { getProjects } from "@/lib/data/projects";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { formatJournalDate } from "@/lib/utils";

/**
 * Prisma tidak jalan di edge runtime, jadi route ini memakai Node.js agar bisa
 * mengambil data asli website untuk di-inject ke system prompt.
 */
export const runtime = "nodejs";
export const maxDuration = 30;

const RATE_LIMIT_MESSAGES = 20;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_REQUEST_CHARS = 50_000;
const JOURNAL_PREVIEW_LENGTH = 160;

/**
 * Ambil data dengan fallback, tapi tetap log penyebabnya — sebelumnya error
 * koneksi DB ditelan diam-diam dan AI jadi mengaku tidak punya data.
 */
function withFallback<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch((error: unknown) => {
    console.error(`[chat] gagal memuat ${label}:`, error);
    return fallback;
  });
}

type SiteContentDigest = {
  works: Array<{ title: string; category: string; description: string; url: string; featured: boolean }>;
  essays: Array<{ title: string; path: string; publishedAt: string; excerpt: string }>;
  journals: Array<{ title: string; publishedAt: string; preview: string }>;
  povVideos: Array<{ title: string }>;
};

/** Ambil ringkasan konten asli website; di-cache agar tidak query DB tiap chat. */
const getSiteContent = unstable_cache(
  async (): Promise<SiteContentDigest> => {
    const [works, essays, journals, povVideos] = await Promise.all([
      withFallback(
        "works",
        getProjects().then((projects) =>
          projects.map((project) => ({
            title: project.title,
            category: project.category,
            description: project.description,
            url: project.url,
            featured: project.featured
          }))
        ),
        []
      ),
      withFallback(
        "essays",
        getEssays().then((essayList) =>
          essayList.map((essay) => ({
            title: essay.title,
            path: `/essays/${essay.slug}`,
            publishedAt: formatJournalDate(essay.publishedAt),
            excerpt: essay.excerpt
          }))
        ),
        []
      ),
      withFallback(
        "journals",
        getJournals().then((journalList) =>
          journalList.slice(0, 12).map((journal) => ({
            title: journal.title,
            publishedAt: formatJournalDate(journal.publishedAt),
            preview:
              journal.content
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, JOURNAL_PREVIEW_LENGTH) +
              (journal.content.length > JOURNAL_PREVIEW_LENGTH ? "…" : "")
          }))
        ),
        []
      ),
      withFallback(
        "pov videos",
        getPovVideos().then((videos) => videos.map((video) => ({ title: video.title }))),
        []
      )
    ]);

    return { works, essays, journals, povVideos };
  },
  ["chat-site-content"],
  { revalidate: 300, tags: ["chat-site-content"] }
);

function buildSystemPrompt(content: SiteContentDigest) {
  const worksSection =
    content.works.length > 0
      ? content.works
          .map(
            (work) =>
              `- ${work.title} — kategori: ${work.category}${work.featured ? " (Featured)" : ""} — ${work.description} — link: ${work.url}`
          )
          .join("\n")
      : "(belum ada data works)";

  const essaysSection =
    content.essays.length > 0
      ? content.essays
          .map((essay) => `- ${essay.title} (${essay.publishedAt}) — ${essay.path}\n  Ringkasan: ${essay.excerpt}`)
          .join("\n")
      : "(belum ada essay)";

  const journalsSection =
    content.journals.length > 0
      ? content.journals.map((journal) => `- ${journal.title} (${journal.publishedAt}) — ${journal.preview}`).join("\n")
      : "(belum ada jurnal)";

  const povSection =
    content.povVideos.length > 0
      ? content.povVideos.map((video) => `- ${video.title}`).join("\n")
      : "(belum ada video POV)";

  return `You are a friendly and knowledgeable AI assistant for **works** — the personal portfolio website of **Muhammad Ihsanul Hakim Mokhsen** (also known as Ihsan Mokhsen / @alhakimi).

Your role is to help visitors explore the portfolio, learn about Ihsan's work, and guide them through the website.

## About Ihsan Mokhsen
- Full name: Muhammad Ihsanul Hakim Mokhsen, S.Kom., M.S.F
- Role: Government IT practitioner and graduate researcher
- Field: Digital Forensics & Information Security
- Research: Adaptation and Validation of HAIS-Q for Measuring Information Security Awareness in Indonesian Government Institutions (IEEE ICoCICs 2025)
- Current focus: Thesis on improving HAIS-Q, government cybersecurity awareness, AI and data protection
- Location: Makassar, Indonesia (UTC+8)
- Email: ihsanmokhsen17@gmail.com
- LinkedIn: linkedin.com/in/ihsanmokhsen
- GitHub: github.com/ihsanmokhsen
- Website: ihsanmokhsen.com

## Website Pages & Navigation
1. **Home (/)**: Hero section with animated title, clock, CTA buttons ("Explore Works", "Baca Jurnal Harian"), portfolio grid of projects, running text marquee.
2. **Works (/works)**: Grid semua aplikasi & proyek dengan pencarian dan tampilan grid/list.
3. **Stories (/journal)**: Catatan harian dengan layout grid.
4. **Essays (/essays)**: Tulisan panjang dan pemikiran serius.
5. **POV (/pov)**: Video vertikal YouTube singkat.
6. **About (/about)**: Profil, publikasi, fokus profesional, dan kontak.

## Data konten website (LIVE — sumber kebenaran untuk jawaban spesifik)
Data di bawah ini diambil langsung dari database website. Gunakan ini untuk menjawab pertanyaan spesifik, sebutkan judul yang benar-benar ada, dan arahkan pengunjung ke path yang benar.

### Daftar Works (aplikasi & proyek)
${worksSection}

### Daftar Essays
${essaysSection}

### Stories/Jurnal terbaru
${journalsSection}

### Video POV
${povSection}

## What You Can Help With
- **Portfolio**: Explain projects with REAL titles and descriptions from the live data above.
- **Navigation**: Point visitors to the right page/path based on the live data.
- **Consultation**: If someone wants to build a website or needs consultation, guide them to email ihsanmokhsen17@gmail.com and mention that initial consultation is free.
- **General questions**: Answer questions about Ihsan's background, research, publications, and skills.

## Guidelines
- Respond in **Bahasa Indonesia** unless the user asks in English.
- Be friendly, professional, and concise.
- Saat menyebut essay atau jurnal, sebutkan judul persis seperti di data live dan path-nya (misal: baca di /essays/nama-slug).
- Jika yang ditanyakan tidak ada di data live (misalnya judul proyek/essay yang tidak tercantum), jawab jujur bahwa info belum tersedia di website dan sarankan menjelajah langsung — JANGAN mengarang judul atau isi.
- For consultation inquiries, always encourage emailing ihsanmokhsen17@gmail.com.
- Keep responses helpful but not overly verbose.`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`chat:${ip}`, RATE_LIMIT_MESSAGES, RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.ok) {
    return new Response(
      `Terlalu banyak pesan. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik ya.`,
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "Content-Type": "text/plain; charset=utf-8"
        }
      }
    );
  }

  let messages: UIMessage[];
  try {
    const body = await req.json();
    messages = body?.messages;
  } catch {
    return new Response("Permintaan tidak valid.", { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0 || JSON.stringify(messages).length > MAX_REQUEST_CHARS) {
    return new Response("Permintaan tidak valid.", { status: 400 });
  }

  // Batasi riwayat agar biaya token tetap terkendali.
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  const content = await getSiteContent();

  try {
    const result = streamText({
      model: google("gemini-3.5-flash-lite"),
      system: buildSystemPrompt(content),
      messages: await convertToModelMessages(recentMessages)
    });

    return result.toUIMessageStreamResponse();
  } catch {
    return new Response("Asisten AI sedang sibuk. Coba lagi sebentar lagi ya.", {
      status: 502
    });
  }
}
