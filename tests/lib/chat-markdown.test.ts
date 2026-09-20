import { describe, expect, it } from "vitest";

import { isSafeHref, parseChatInline, parseChatMarkdown } from "@/lib/chat-markdown";

describe("parseChatInline", () => {
  it("memisahkan bold, code, dan teks biasa", () => {
    expect(parseChatInline("**Works** (`/works`)")).toEqual([
      { type: "strong", value: "Works" },
      { type: "text", value: " (" },
      { type: "code", value: "/works" },
      { type: "text", value: ")" }
    ]);
  });

  it("mengubah markdown link menjadi inline link", () => {
    expect(parseChatInline("baca [jurnal](/journal) ya")).toEqual([
      { type: "text", value: "baca " },
      { type: "link", value: "jurnal", href: "/journal" },
      { type: "text", value: " ya" }
    ]);
  });

  it("membiarkan link tidak aman sebagai teks", () => {
    expect(parseChatInline("[klik](javascript:alert(1))")).toEqual([
      { type: "text", value: "[klik](javascript:alert(1))" }
    ]);
  });

  it("mengenali italic tanpa menelan bold", () => {
    expect(parseChatInline("*miring* dan **tebal**")).toEqual([
      { type: "em", value: "miring" },
      { type: "text", value: " dan " },
      { type: "strong", value: "tebal" }
    ]);
  });
});

describe("isSafeHref", () => {
  it("mengizinkan path internal dan https", () => {
    expect(isSafeHref("/works")).toBe(true);
    expect(isSafeHref("https://ihsanmokhsen.com")).toBe(true);
  });

  it("menolak protocol berbahaya dan path protocol-relative", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("//evil.example.com")).toBe(false);
  });
});

describe("parseChatMarkdown", () => {
  it("mengubah heading dan daftar menjadi block terpisah", () => {
    const blocks = parseChatMarkdown(
      "### Halaman\n\n- **Home** — hero\n- **Works** (`/works`)\n\n1. Pertama\n2. Kedua"
    );

    expect(blocks.map((block) => block.type)).toEqual(["heading", "list", "list"]);
    expect(blocks[1]).toMatchObject({ type: "list", ordered: false });
    expect(blocks[2]).toMatchObject({ type: "list", ordered: true });
    expect((blocks[1] as { items: unknown[] }).items).toHaveLength(2);
  });

  it("menggabungkan baris berurutan menjadi satu paragraf", () => {
    const blocks = parseChatMarkdown("Baris satu\nbaris dua\n\nParagraf dua");

    expect(blocks).toEqual([
      {
        type: "paragraph",
        inlines: [{ type: "text", value: "Baris satu baris dua" }]
      },
      { type: "paragraph", inlines: [{ type: "text", value: "Paragraf dua" }] }
    ]);
  });

  it("tidak menganggap italic di awal baris sebagai bullet", () => {
    const blocks = parseChatMarkdown("*ini miring*");

    expect(blocks).toEqual([
      { type: "paragraph", inlines: [{ type: "em", value: "ini miring" }] }
    ]);
  });

  it("tetap aman untuk output streaming yang belum lengkap", () => {
    expect(parseChatMarkdown("**Belum sel")).toEqual([
      { type: "paragraph", inlines: [{ type: "text", value: "**Belum sel" }] }
    ]);
  });
});
