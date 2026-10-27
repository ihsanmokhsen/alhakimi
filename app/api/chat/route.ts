import { unstable_cache } from "next/cache";

import { getEssays } from "@/lib/data/essays";
import { getJournals } from "@/lib/data/journals";
import { getPovVideos } from "@/lib/data/pov-videos";
import { getProjects } from "@/lib/data/projects";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { answerQuestion, buildKnowledgeIndex, type KnowledgeIndex, type SiteContent } from "@/lib/site-rag";
import { formatJournalDate } from "@/lib/utils";

/**
 * Prisma tidak jalan di edge runtime, jadi route ini memakai Node.js agar bisa
 * mengambil konten asli website sebagai basis pencarian jawaban.
 */
export const runtime = "nodejs";

const RATE_LIMIT_MESSAGES = 30;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_QUESTION_CHARS = 500;

/**
 * Ambil data dengan fallback, tapi tetap log penyebabnya — kalau error koneksi DB
 * ditelan diam-diam, asisten jadi mengaku tidak punya data.
 */
function withFallback<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch((error: unknown) => {
    console.error(`[chat] gagal memuat ${label}:`, error);
    return fallback;
  });
}

/**
 * Hanya field yang memang tampil di halaman publik yang diambil; tidak ada data admin,
 * token, atau gambar. Di-cache agar tidak query DB tiap pertanyaan.
 */
const getSiteContent = unstable_cache(
  async (): Promise<SiteContent> => {
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
            slug: essay.slug,
            excerpt: essay.excerpt,
            content: essay.content,
            publishedAt: formatJournalDate(essay.publishedAt)
          }))
        ),
        []
      ),
      withFallback(
        "journals",
        getJournals().then((journalList) =>
          journalList.map((journal) => ({
            id: journal.id,
            title: journal.title,
            content: journal.content,
            publishedAt: formatJournalDate(journal.publishedAt)
          }))
        ),
        []
      ),
      withFallback(
        "pov videos",
        getPovVideos().then((videos) => videos.map((video) => ({ title: video.title, youtubeUrl: video.youtubeUrl }))),
        []
      )
    ]);

    return { works, essays, journals, povVideos };
  },
  ["chat-site-content-rag"],
  { revalidate: 300, tags: ["chat-site-content"] }
);

// Indeks dibangun ulang hanya saat konten yang di-cache berubah.
// unstable_cache bisa mengembalikan objek baru tiap panggilan, jadi bandingkan isinya.
let cachedIndex: { fingerprint: string; index: KnowledgeIndex } | null = null;

async function getKnowledgeIndex() {
  const content = await getSiteContent();
  const fingerprint = JSON.stringify(content);
  if (cachedIndex?.fingerprint !== fingerprint) {
    cachedIndex = { fingerprint, index: buildKnowledgeIndex(content) };
  }
  return cachedIndex.index;
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

  let question: unknown;
  try {
    const body = await req.json();
    question = body?.question;
  } catch {
    return new Response("Permintaan tidak valid.", { status: 400 });
  }

  if (typeof question !== "string" || !question.trim() || question.length > MAX_QUESTION_CHARS) {
    return new Response("Permintaan tidak valid.", { status: 400 });
  }

  try {
    const answer = answerQuestion(await getKnowledgeIndex(), question);
    return Response.json({ answer });
  } catch (error) {
    console.error("[chat] permintaan gagal:", error);
    return new Response("Asisten sedang bermasalah. Coba lagi sebentar lagi ya.", { status: 500 });
  }
}
