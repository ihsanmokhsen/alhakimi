/**
 * Asisten "works AI" berbasis retrieval murni (tanpa model generatif).
 *
 * Jawaban selalu disusun dari potongan konten PUBLIK website: profil, halaman,
 * works, essays, stories, dan video POV. Tidak ada teks yang dikarang; kalau
 * tidak ada potongan yang relevan, asisten bilang jujur bahwa infonya tidak ada.
 *
 * Perlindungan informasi rahasia berlapis:
 * 1. Basis pengetahuan hanya dibangun dari field yang memang tampil di website
 *    (tidak pernah menyentuh tabel admin, token reset, env, atau file biner).
 * 2. Pertanyaan yang meminta kredensial/data internal langsung ditolak.
 * 3. Potongan teks yang dikembalikan disaring dari pola mirip rahasia
 *    (API key, token panjang, connection string, nomor telepon, email lain).
 */

import { stripEssayImageMarkers } from "@/lib/essay-content";
import { PERSON_ALTERNATE_NAME, PERSON_NAME, PRIMARY_PAGES } from "@/lib/seo";

export const PUBLIC_CONTACT_EMAIL = "ihsanmokhsen17@gmail.com";

export type SiteContent = {
  works: Array<{ title: string; category: string; description: string; url: string; featured: boolean }>;
  essays: Array<{ title: string; slug: string; excerpt: string; content: string; publishedAt: string }>;
  journals: Array<{ id: string; title: string; content: string; publishedAt: string }>;
  povVideos: Array<{ title: string; youtubeUrl: string }>;
};

type DocKind = "profile" | "page" | "work" | "essay" | "journal" | "pov" | "contact";

export type KnowledgeDoc = {
  id: string;
  kind: DocKind;
  title: string;
  text: string;
  href: string;
};

type IndexedDoc = KnowledgeDoc & { terms: Map<string, number>; length: number };

export type KnowledgeIndex = {
  docs: IndexedDoc[];
  docFrequency: Map<string, number>;
  averageLength: number;
  content: SiteContent;
};

/** Panjang maksimum satu potongan essay/story agar hasil pencarian tetap spesifik. */
const CHUNK_CHARS = 700;
const SNIPPET_CHARS = 260;
const MAX_RESULTS = 3;
const MAX_QUESTION_CHARS = 500;
/** Skor minimum (BM25) agar sebuah potongan dianggap relevan. */
const MIN_SCORE = 1.2;

// ── Profil statis (sama dengan yang tampil di /about) ─────────────────────────
const PROFILE_DOCS: KnowledgeDoc[] = [
  {
    id: "profile:bio",
    kind: "profile",
    title: `Tentang ${PERSON_ALTERNATE_NAME}`,
    text: `${PERSON_NAME}, S.Kom., M.S.F (${PERSON_ALTERNATE_NAME}, alhakimi) adalah Pranata Komputer pada Badan Pendapatan dan Aset Daerah (BPAD) Provinsi Nusa Tenggara Timur di Kupang. Latar belakangnya mencakup ilmu komputer, forensik digital, dan keamanan informasi. Ia menghubungkan riset dengan praktik: membangun aplikasi, merancang pengalaman pengguna, mengelola data, dan membuat konsep keamanan mudah diterapkan.`,
    href: "/about"
  },
  {
    id: "profile:research",
    kind: "profile",
    title: "Riset & publikasi",
    text: "Riset Ihsan berfokus pada kesadaran keamanan informasi melalui HAIS-Q (Human Aspects of Information Security Questionnaire). Publikasinya: Adaptation and Validation of HAIS-Q for Measuring Information Security Awareness in Indonesian Government Institutions, di 2025 IEEE 2nd International Conference on Cryptography, Informatics, and Cybersecurity (ICoCICs). Fokus saat ini: pengembangan dan penyempurnaan HAIS-Q, kesadaran keamanan siber di pemerintahan, serta kecerdasan buatan dan perlindungan data.",
    href: "/about"
  },
  {
    id: "profile:work",
    kind: "profile",
    title: "Pekerjaan & keahlian",
    text: "Ihsan mengembangkan layanan digital pemerintahan seperti Absen Pagi Perbidang dan platform Optimalisasi PAD NTT. Ia juga membangun dan merawat works.ihsanmokhsen.com: portofolio karya, jurnal, esai, video POV, dasbor admin, dan asisten chat. Keahliannya meliputi forensik digital, keamanan informasi, pengembangan web, desain antarmuka, basis data, SEO, dan optimasi performa.",
    href: "/about"
  },
  {
    id: "profile:site",
    kind: "page",
    title: "Tentang website ini",
    text: "works adalah website portofolio Ihsan Mokhsen, dibangun dengan Next.js, React, Tailwind CSS, dan Prisma. Isinya Works (aplikasi & proyek), Stories (catatan harian), Essays (tulisan panjang), POV (video vertikal singkat), dan About (profil). Asisten chat ini menjawab dengan mencari langsung di konten website, tanpa model AI generatif.",
    href: "/"
  }
];

const CONTACT_DOC: KnowledgeDoc = {
  id: "contact",
  kind: "contact",
  title: "Kontak & konsultasi",
  text: `Untuk konsultasi website, aplikasi, atau kerja sama, hubungi Ihsan lewat email ${PUBLIC_CONTACT_EMAIL}. Konsultasi awal gratis. Profil lain: LinkedIn linkedin.com/in/ihsanmokhsen, GitHub github.com/ihsanmokhsen, dan ihsanmokhsen.com.`,
  href: `mailto:${PUBLIC_CONTACT_EMAIL}`
};

// ── Normalisasi & tokenisasi ─────────────────────────────────────────────────
const STOPWORDS = new Set(
  (
    "yang dan di ke dari untuk pada dengan ini itu apa saja ada adalah atau juga dalam akan bisa tentang " +
    "saya aku kamu anda dia ia mereka kita kami nya sih dong ya kah lah pun tolong mohon coba tau tahu " +
    "bagaimana gimana kenapa mengapa siapa kapan dimana mana berapa sudah belum pernah sedang lagi buat " +
    "the a an and or of to in on for with is are was were what which who how why when where do does " +
    "can could please about me you your i my this that it"
  ).split(" ")
);

/** Kata sepadan Indonesia/Inggris agar "project" menemukan "proyek", dsb. */
const SYNONYMS: Record<string, string[]> = {
  project: ["proyek", "karya", "aplikasi", "work"],
  proyek: ["project", "karya", "aplikasi", "work"],
  karya: ["project", "proyek", "aplikasi", "work"],
  aplikasi: ["app", "project", "proyek", "karya"],
  app: ["aplikasi"],
  work: ["karya", "project", "proyek"],
  esai: ["essay", "tulis"],
  essay: ["esai", "tulis"],
  tulis: ["essay", "esai"],
  jurnal: ["journal", "story", "cerita", "catat"],
  journal: ["jurnal", "story", "cerita", "catat"],
  story: ["jurnal", "cerita", "catat"],
  cerita: ["story", "jurnal"],
  catat: ["story", "jurnal"],
  video: ["pov"],
  pov: ["video"],
  riset: ["research", "penelitian", "publikasi"],
  research: ["riset", "penelitian"],
  penelitian: ["riset", "research"],
  publikasi: ["paper", "riset"],
  paper: ["publikasi"],
  keamanan: ["security"],
  security: ["keamanan"],
  forensik: ["forensic"],
  forensic: ["forensik"],
  website: ["web", "situs", "site"],
  web: ["website", "situs"],
  situs: ["website", "web"],
  pemerintah: ["government", "pemerintahan"],
  government: ["pemerintah"]
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
}

/** Stemming ringan: buang partikel & akhiran umum Indonesia serta jamak Inggris. */
function stem(word: string) {
  let result = word.replace(/(nya|lah|kah|pun)$/, "");
  if (result.length > 6) result = result.replace(/(kan|an)$/, "");
  if (result.length > 5) result = result.replace(/(ies)$/, "y").replace(/([^s])s$/, "$1");
  return result.length >= 2 ? result : word;
}

export function tokenize(text: string) {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem);
}

function expandQuery(terms: string[]) {
  const expanded = new Map<string, number>();
  for (const term of terms) {
    expanded.set(term, Math.max(expanded.get(term) ?? 0, 1));
    for (const synonym of SYNONYMS[term] ?? []) {
      // Sinonim bobotnya lebih kecil agar kata asli tetap lebih menentukan.
      expanded.set(synonym, Math.max(expanded.get(synonym) ?? 0, 0.5));
    }
  }
  return expanded;
}

// ── Penjaga informasi rahasia ────────────────────────────────────────────────
const SENSITIVE_PATTERNS = [
  /\b(password|passwd|kata\s*sandi|sandi)\b/,
  /\b(api[\s_-]*key|apikey|secret[\s_-]*key|private[\s_-]*key|access[\s_-]*key)\b/,
  /\b(token|jwt|session|cookie|otp|2fa)\b/,
  /\b(kredensial|credential|credentials)\b/,
  /(^|\s)\.?env\b|\benvironment variable|\bvariabel lingkungan/,
  /\b(database[\s_-]*url|connection[\s_-]*string|postgres(ql)?:\/\/|supabase key|prisma schema)\b/,
  /\b(login|akun|akses|masuk|panel|dashboard|dasbor)\s+admin\b|\badmin\s+(login|password|akun|username|panel)\b/,
  /\b(username|hash|bcrypt|salt)\b/,
  /\b(source\s*code|kode\s*sumber)\s+(rahasia|privat|private)/,
  /\b(data|info|informasi|dokumen)\s+(rahasia|internal|pribadi|private|confidential)\b/,
  /\b(nik|ktp|npwp|rekening|nomor\s*(hp|telepon|telp|wa|whatsapp)|alamat\s*rumah|gaji|nip)\b/,
  /\b(ssh|server\s*ip|ip\s*server|vercel\s*token|resend\s*key|gemini\s*key)\b/
];

export function isSensitiveQuestion(question: string) {
  const text = normalize(question);
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}

const PUBLIC_EMAIL_PATTERN = new RegExp(PUBLIC_CONTACT_EMAIL.replace(/[.]/g, "\\."), "i");

/** Samarkan pola mirip rahasia yang mungkin tidak sengaja ada di teks konten. */
export function redactSecrets(text: string) {
  return text
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:[^\s@/]+@\S+/gi, "[disamarkan]")
    .replace(/\b(sk|pk|rk|re|ghp|gho|xox[abp])[-_][A-Za-z0-9_-]{12,}\b/g, "[disamarkan]")
    .replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, "[disamarkan]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\b/g, "[disamarkan]")
    .replace(/\b[A-Za-z0-9_-]*[0-9][A-Za-z0-9_-]*[A-Za-z][A-Za-z0-9_-]{30,}\b/g, "[disamarkan]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, (email) => (PUBLIC_EMAIL_PATTERN.test(email) ? email : "[email disamarkan]"))
    .replace(/(\+62|\b0)8[\d\s-]{7,13}\d\b/g, "[nomor disamarkan]");
}

// ── Pembangunan indeks ───────────────────────────────────────────────────────
function flatten(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

/** Pecah teks panjang per paragraf menjadi potongan ±CHUNK_CHARS karakter. */
function chunkText(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(flatten)
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > CHUNK_CHARS) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current} ${paragraph}` : paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
}

export function buildKnowledgeDocs(content: SiteContent): KnowledgeDoc[] {
  const docs: KnowledgeDoc[] = [...PROFILE_DOCS, CONTACT_DOC];

  for (const page of PRIMARY_PAGES) {
    docs.push({ id: `page:${page.path}`, kind: "page", title: `Halaman ${page.name}`, text: page.description, href: page.path });
  }

  for (const work of content.works) {
    docs.push({
      id: `work:${work.url}`,
      kind: "work",
      title: work.title,
      text: `${flatten(work.description)} (Kategori ${work.category}${work.featured ? ", karya unggulan" : ""}.)`,
      href: work.url
    });
  }

  for (const essay of content.essays) {
    const href = `/essays/${encodeURIComponent(essay.slug)}`;
    docs.push({
      id: `essay:${essay.slug}:0`,
      kind: "essay",
      title: essay.title,
      text: `${essay.title}. Esai terbit ${essay.publishedAt}. ${flatten(essay.excerpt)}`,
      href
    });
    chunkText(stripEssayImageMarkers(essay.content)).forEach((chunk, index) => {
      docs.push({ id: `essay:${essay.slug}:${index + 1}`, kind: "essay", title: essay.title, text: chunk, href });
    });
  }

  for (const journal of content.journals) {
    const href = `/journal/${encodeURIComponent(journal.id)}`;
    chunkText(journal.content).forEach((chunk, index) => {
      docs.push({
        id: `journal:${journal.id}:${index}`,
        kind: "journal",
        title: journal.title,
        text: index === 0 ? `${journal.title} (${journal.publishedAt}). ${chunk}` : chunk,
        href
      });
    });
  }

  for (const video of content.povVideos) {
    docs.push({ id: `pov:${video.youtubeUrl}`, kind: "pov", title: video.title, text: `Video POV: ${video.title}`, href: "/pov" });
  }

  return docs;
}

export function buildKnowledgeIndex(content: SiteContent): KnowledgeIndex {
  const docFrequency = new Map<string, number>();
  const docs = buildKnowledgeDocs(content).map((doc) => {
    const terms = new Map<string, number>();
    // Judul dihitung dua kali agar kecocokan judul lebih diutamakan.
    for (const term of [...tokenize(doc.title), ...tokenize(doc.title), ...tokenize(doc.text)]) {
      terms.set(term, (terms.get(term) ?? 0) + 1);
    }
    for (const term of terms.keys()) docFrequency.set(term, (docFrequency.get(term) ?? 0) + 1);
    const length = Array.from(terms.values()).reduce((sum, count) => sum + count, 0);
    return { ...doc, terms, length };
  });
  const averageLength = docs.reduce((sum, doc) => sum + doc.length, 0) / Math.max(docs.length, 1);

  return { docs, docFrequency, averageLength, content };
}

// ── Pencarian (BM25) ─────────────────────────────────────────────────────────
export type SearchHit = { doc: KnowledgeDoc; score: number };

export function search(index: KnowledgeIndex, question: string, limit = MAX_RESULTS): SearchHit[] {
  const query = expandQuery(tokenize(question));
  if (query.size === 0) return [];

  const k1 = 1.4;
  const b = 0.75;
  const total = index.docs.length;
  const best = new Map<string, SearchHit>();

  for (const doc of index.docs) {
    let score = 0;
    for (const [term, weight] of query) {
      const frequency = doc.terms.get(term);
      if (!frequency) continue;
      const df = index.docFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (total - df + 0.5) / (df + 0.5));
      score += weight * idf * ((frequency * (k1 + 1)) / (frequency + k1 * (1 - b + (b * doc.length) / index.averageLength)));
    }
    if (score < MIN_SCORE) continue;

    // Satu halaman cukup diwakili potongan terbaiknya.
    const previous = best.get(doc.href);
    if (!previous || previous.score < score) best.set(doc.href, { doc, score });
  }

  const hits = Array.from(best.values()).sort((left, right) => right.score - left.score);
  // Buang hasil yang jauh lebih lemah dari hasil teratas.
  return hits.filter((hit) => hit.score >= hits[0].score * 0.35).slice(0, limit);
}

/** Pilih kalimat paling relevan dari potongan sebagai cuplikan jawaban. */
export function bestSnippet(text: string, question: string) {
  const queryTerms = new Set(expandQuery(tokenize(question)).keys());
  // Pisah kalimat hanya di tanda baca yang diikuti spasi + huruf besar, agar "Next.js" atau "gmail.com" utuh.
  const sentences = flatten(text).split(/(?<=[.!?…])\s+(?=[A-Z0-9"“(])/);

  let bestIndex = 0;
  let bestScore = -1;
  sentences.forEach((sentence, index) => {
    const score = tokenize(sentence).filter((term) => queryTerms.has(term)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  let snippet = sentences[bestIndex].trim();
  for (let next = bestIndex + 1; next < sentences.length && snippet.length < SNIPPET_CHARS * 0.6; next += 1) {
    snippet = `${snippet} ${sentences[next].trim()}`;
  }
  if (snippet.length > SNIPPET_CHARS) snippet = `${snippet.slice(0, SNIPPET_CHARS - 1).trimEnd()}…`;
  return redactSecrets(snippet);
}

// ── Penyusunan jawaban ───────────────────────────────────────────────────────
/** Hindari karakter yang merusak sintaks markdown link di bubble chat. */
function linkLabel(text: string) {
  return text.replace(/[[\]()]/g, "").trim();
}

function linkFor(doc: KnowledgeDoc) {
  if (doc.kind === "contact") return `Email: **${PUBLIC_CONTACT_EMAIL}**`;
  const label = doc.kind === "work" ? "Buka aplikasi" : doc.kind === "pov" ? "Tonton di POV" : "Baca selengkapnya";
  return `[${label}](${doc.href})`;
}

const GREETING_PATTERN = /^(hai|halo|hallo|hello|hi|hey|pagi|siang|sore|malam|selamat\s+\w+|assalamu.?alaikum|salam|p)\W*$/;
const THANKS_PATTERN = /^(makasih|terima\s*kasih|thanks|thank\s+you|thx|mantap|oke|ok|sip)\W*$/;
const LIST_PATTERN = /\b(apa\s+saja|apa\s+aja|daftar|list|semua|sebutkan|contoh|what)\b/;
const CONTACT_PATTERN = /\b(konsultasi|kontak|hubungi|contact|email|hire|jasa|kerja\s*sama|kolaborasi|order|pesan\s+website|bikin\s+website|buat\s+website|harga|biaya)\b/;
const PROFILE_PATTERN = /\b(siapa|profil|profile|background|latar\s*belakang|biodata|about|tentang\s+ihsan|pendidikan|pekerjaan)\b/;
const SITE_PATTERN = /\b(website|situs|web|chat|asisten|bot)\s+ini\b|\bcara\s+kerja\b|\bdibuat\s+(pakai|dengan)\b|\btech\s*stack\b/;

type ListIntent = { kind: "work" | "essay" | "journal" | "pov"; pattern: RegExp };

const LIST_INTENTS: ListIntent[] = [
  { kind: "work", pattern: /\b(project|proyek|projek|karya|works?|aplikasi|app|portfolio|portofolio)\b/ },
  { kind: "essay", pattern: /\b(essays?|esai|tulisan)\b/ },
  { kind: "journal", pattern: /\b(stories|story|jurnal|journal|catatan|cerita)\b/ },
  { kind: "pov", pattern: /\b(pov|video)\b/ }
];

function listAnswer(kind: ListIntent["kind"], content: SiteContent) {
  if (kind === "work") {
    if (content.works.length === 0) return "Belum ada works yang tercantum di website. Cek lagi nanti di [Works](/works).";
    const items = content.works.map((work) => `- **${work.title}** — ${work.category}. [Buka](${work.url})`);
    return [`Ada ${content.works.length} karya di website:`, ...items, "", "Lihat semuanya di [Works](/works)."].join("\n");
  }
  if (kind === "essay") {
    if (content.essays.length === 0) return "Belum ada essay yang terbit. Cek lagi nanti di [Essays](/essays).";
    const items = content.essays.map((essay) => `- [${linkLabel(essay.title)}](/essays/${encodeURIComponent(essay.slug)}) — ${essay.publishedAt}`);
    return [`Ada ${content.essays.length} essay:`, ...items].join("\n");
  }
  if (kind === "journal") {
    if (content.journals.length === 0) return "Belum ada stories. Cek lagi nanti di [Stories](/journal).";
    const latest = content.journals.slice(0, 8);
    const items = latest.map((journal) => `- [${linkLabel(journal.title)}](/journal/${encodeURIComponent(journal.id)}) — ${journal.publishedAt}`);
    return [`Stories terbaru:`, ...items, "", "Semua catatan ada di [Stories](/journal)."].join("\n");
  }
  if (content.povVideos.length === 0) return "Belum ada video POV. Cek lagi nanti di [POV](/pov).";
  const items = content.povVideos.map((video) => `- ${video.title}`);
  return [`Ada ${content.povVideos.length} video POV:`, ...items, "", "Tonton di [POV](/pov)."].join("\n");
}

function docAnswer(docs: KnowledgeDoc[], question: string) {
  return docs.map((doc) => `**${doc.title}**\n${bestSnippet(doc.text, question)} ${linkFor(doc)}`).join("\n\n");
}

const NOT_FOUND_ANSWER = [
  "Maaf, saya belum menemukan info itu di website. Saya hanya menjawab dari konten yang ada di sini. Coba tanyakan hal lain, misalnya:",
  "- Apa saja project yang pernah dibuat?",
  "- Siapa Ihsan Mokhsen?",
  "- Essay tentang keamanan informasi",
  "",
  "Atau jelajahi [Works](/works), [Essays](/essays), dan [About](/about)."
].join("\n");

export const SENSITIVE_ANSWER =
  "Maaf, saya tidak bisa membagikan informasi rahasia atau internal, seperti kata sandi, API key, token, data admin, konfigurasi server, atau data pribadi. Saya hanya menjawab dari konten publik website. Ada yang lain soal karya, tulisan, atau profil Ihsan?";

/** Jawab satu pertanyaan pengunjung hanya dari konten publik yang terindeks. */
export function answerQuestion(index: KnowledgeIndex, rawQuestion: string) {
  const question = rawQuestion.slice(0, MAX_QUESTION_CHARS).trim();
  const text = normalize(question);

  if (!text) return "Silakan ketik pertanyaan tentang karya, tulisan, atau profil Ihsan.";
  if (isSensitiveQuestion(question)) return SENSITIVE_ANSWER;
  if (GREETING_PATTERN.test(text)) {
    return "Hai! 👋 Saya bisa bantu mencari info di website ini: daftar works, essay, stories, video POV, atau profil Ihsan. Mau tahu apa?";
  }
  if (THANKS_PATTERN.test(text)) return "Sama-sama! Kalau ada pertanyaan lain soal website ini, tanya saja.";

  if (CONTACT_PATTERN.test(text)) {
    return `${CONTACT_DOC.text}\n\nKamu juga bisa klik tombol konsultasi di halaman utama.`;
  }

  const listIntent = LIST_INTENTS.find((intent) => intent.pattern.test(text));
  // "essay" saja = daftar; "essay tentang AI" = cari isinya.
  const isBareTopic = listIntent && normalize(question).replace(listIntent.pattern, "").replace(/\W+/g, "").length === 0;
  if (listIntent && (LIST_PATTERN.test(text) || isBareTopic)) {
    return listAnswer(listIntent.kind, index.content);
  }

  if (SITE_PATTERN.test(text)) {
    return `Ini yang ada di website:\n\n${docAnswer(PROFILE_DOCS.filter((doc) => doc.id === "profile:site"), question)}`;
  }
  if (PROFILE_PATTERN.test(text)) {
    return `Ini yang ada di website:\n\n${docAnswer(PROFILE_DOCS.filter((doc) => doc.kind === "profile"), question)}`;
  }

  const hits = search(index, question);
  if (hits.length === 0) return NOT_FOUND_ANSWER;

  return `Ini yang saya temukan di website:\n\n${docAnswer(
    hits.map((hit) => hit.doc),
    question
  )}`;
}
