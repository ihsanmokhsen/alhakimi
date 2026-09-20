/**
 * Parser markdown ringan khusus untuk bubble chat AI.
 *
 * Balasan Gemini selalu memakai markdown (`**bold**`, `- list`, `### heading`),
 * sedangkan bubble chat menampilkan teks mentah sehingga tanda `**` ikut terlihat.
 * Parser ini hanya menangani subset yang benar-benar dipakai model, tanpa
 * menambah dependency baru.
 */

export type ChatInline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

export type ChatBlock =
  | { type: "heading"; level: number; inlines: ChatInline[] }
  | { type: "paragraph"; inlines: ChatInline[] }
  | { type: "list"; ordered: boolean; items: ChatInline[][] };

const INLINE_SOURCE =
  "(`[^`]+`|\\*\\*[^*]+\\*\\*|__[^_]+__|\\*[^*\\n]+\\*|_[^_\\n]+_|\\[[^\\]]+\\]\\([^)\\s]+\\))";

const HEADING_PATTERN = /^#{1,6}\s+(.+?)\s*#*$/;
const BULLET_PATTERN = /^[-*+•]\s+(.+)$/;
const ORDERED_PATTERN = /^\d+[.)]\s+(.+)$/;

/** Hanya izinkan path internal atau tautan http(s) agar tidak ada `javascript:` di chat. */
export function isSafeHref(href: string) {
  if (href.startsWith("/")) {
    return !href.startsWith("//");
  }

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseInlineToken(token: string): ChatInline {
  if (token.startsWith("`")) {
    return { type: "code", value: token.slice(1, -1) };
  }

  if (token.startsWith("**") || token.startsWith("__")) {
    return { type: "strong", value: token.slice(2, -2) };
  }

  if (token.startsWith("[")) {
    const separator = token.indexOf("](");
    const label = token.slice(1, separator);
    const href = token.slice(separator + 2, -1);

    return isSafeHref(href) ? { type: "link", value: label, href } : { type: "text", value: token };
  }

  return { type: "em", value: token.slice(1, -1) };
}

/** Gabungkan segmen teks berdekatan agar hasil render tidak terpecah tanpa alasan. */
function pushInline(inlines: ChatInline[], inline: ChatInline) {
  if (inline.type === "text" && inline.value.length === 0) {
    return;
  }

  const previous = inlines[inlines.length - 1];
  if (previous?.type === "text" && inline.type === "text") {
    previous.value += inline.value;
    return;
  }

  inlines.push(inline);
}

export function parseChatInline(value: string): ChatInline[] {
  const inlines: ChatInline[] = [];
  const pattern = new RegExp(INLINE_SOURCE, "g");
  let cursor = 0;

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      pushInline(inlines, { type: "text", value: value.slice(cursor, index) });
    }

    const token = match[0];
    pushInline(inlines, parseInlineToken(token));

    cursor = index + token.length;
  }

  if (cursor < value.length) {
    pushInline(inlines, { type: "text", value: value.slice(cursor) });
  }

  return inlines;
}

export function parseChatMarkdown(value: string): ChatBlock[] {
  const blocks: ChatBlock[] = [];
  const normalized = value.replace(/\r\n?/g, "\n");
  let paragraphs: string[] = [];
  let list: Extract<ChatBlock, { type: "list" }> | null = null;

  const flushParagraph = () => {
    if (paragraphs.length === 0) return;
    blocks.push({ type: "paragraph", inlines: parseChatInline(paragraphs.join(" ")) });
    paragraphs = [];
  };

  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(HEADING_PATTERN);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length, inlines: parseChatInline(heading[1]) });
      continue;
    }

    const bullet = line.match(BULLET_PATTERN);
    if (bullet) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { type: "list", ordered: false, items: [] };
      }
      list.items.push(parseChatInline(bullet[1]));
      continue;
    }

    const ordered = line.match(ORDERED_PATTERN);
    if (ordered) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { type: "list", ordered: true, items: [] };
      }
      list.items.push(parseChatInline(ordered[1]));
      continue;
    }

    flushList();
    paragraphs.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
