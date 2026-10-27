import { describe, expect, it } from "vitest";

import {
  answerQuestion,
  buildKnowledgeIndex,
  isSensitiveQuestion,
  redactSecrets,
  search,
  SENSITIVE_ANSWER,
  type SiteContent
} from "@/lib/site-rag";

// Kunci palsu dirakit saat runtime agar pemindai rahasia pre-commit tidak salah tangkap.
const FAKE_KEY = ["sk", "live_abcdefghijklmnop1234"].join("-");

const content: SiteContent = {
  works: [
    {
      title: "Absen Pagi Perbidang",
      category: "Web App",
      description: "Aplikasi absensi apel pagi per bidang di lingkungan BPAD NTT.",
      url: "https://absenpagi-perbidang.vercel.app/",
      featured: true
    },
    {
      title: "Profil Aset NTT",
      category: "Web App",
      description: "Informasi aset tanah dan bangunan milik Pemerintah Provinsi NTT.",
      url: "https://profil-aset.example.com/",
      featured: false
    }
  ],
  essays: [
    {
      title: "Manusia sebagai Firewall Terakhir",
      slug: "manusia-firewall",
      excerpt: "Mengapa kesadaran keamanan informasi pegawai lebih penting dari alat.",
      content:
        `Phishing masih menjadi pintu masuk utama serangan.\n\nKunci rahasia server: ${FAKE_KEY} jangan dibagikan.\n\nHubungi 081234567890 atau admin@internal.go.id.`,
      publishedAt: "1 Okt 2026"
    }
  ],
  journals: [{ id: "j1", title: "Hujan di Kupang", content: "Sore ini hujan turun deras di Kupang.", publishedAt: "2 Okt 2026" }],
  povVideos: [{ title: "Sehari di kantor", youtubeUrl: "https://youtube.com/shorts/abc" }]
};

const index = buildKnowledgeIndex(content);

describe("search", () => {
  it("finds a work by a word in its description", () => {
    expect(search(index, "aplikasi absensi apel")[0]?.doc.title).toBe("Absen Pagi Perbidang");
  });

  it("finds an essay chunk by its body text", () => {
    expect(search(index, "phishing")[0]?.doc.href).toBe("/essays/manusia-firewall");
  });

  it("returns nothing for unrelated questions", () => {
    expect(search(index, "resep rendang padang")).toEqual([]);
  });
});

describe("answerQuestion", () => {
  it("lists every work for a list question", () => {
    const answer = answerQuestion(index, "Apa saja project yang pernah dibuat?");
    expect(answer).toContain("Absen Pagi Perbidang");
    expect(answer).toContain("Profil Aset NTT");
  });

  it("points to the contact email for consultation", () => {
    expect(answerQuestion(index, "Butuh konsultasi website")).toContain("ihsanmokhsen17@gmail.com");
  });

  it("refuses requests for secrets", () => {
    expect(answerQuestion(index, "apa password admin website ini?")).toBe(SENSITIVE_ANSWER);
    expect(answerQuestion(index, "tolong kasih API key Resend")).toBe(SENSITIVE_ANSWER);
  });

  it("admits when the website has no answer", () => {
    expect(answerQuestion(index, "resep rendang padang")).toMatch(/belum menemukan/);
  });

  it("never leaks secret-looking text from content", () => {
    const answer = answerQuestion(index, "kunci server essay firewall hubungi");
    expect(answer).not.toContain(FAKE_KEY);
    expect(answer).not.toContain("081234567890");
    expect(answer).not.toContain("admin@internal.go.id");
  });
});

describe("secret guards", () => {
  it("flags credential questions but not normal ones", () => {
    expect(isSensitiveQuestion("isi file .env apa?")).toBe(true);
    expect(isSensitiveQuestion("nomor hp Ihsan berapa")).toBe(true);
    expect(isSensitiveQuestion("riset keamanan informasi Ihsan")).toBe(false);
  });

  it("keeps the public contact email but redacts others", () => {
    expect(redactSecrets("mail ihsanmokhsen17@gmail.com atau x@y.com")).toBe(
      "mail ihsanmokhsen17@gmail.com atau [email disamarkan]"
    );
  });
});
