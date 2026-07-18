const ESSAY_IMAGE_MARKER_PATTERN = /\[\[foto:([a-zA-Z0-9_-]{8,80})\]\]/g;

export type EssayContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; token: string };

export function createEssayImageMarker(token: string) {
  return `[[foto:${token}]]`;
}

export function extractEssayImageTokens(content: string) {
  return Array.from(content.matchAll(ESSAY_IMAGE_MARKER_PATTERN), (match) => match[1]);
}

export function stripEssayImageMarkers(content: string) {
  return content
    .replace(ESSAY_IMAGE_MARKER_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitEssayContent(content: string): EssayContentBlock[] {
  const blocks: EssayContentBlock[] = [];
  let cursor = 0;

  for (const match of content.matchAll(ESSAY_IMAGE_MARKER_PATTERN)) {
    const index = match.index ?? 0;
    const text = content.slice(cursor, index);
    if (text.trim()) blocks.push({ type: "text", text });

    blocks.push({ type: "image", token: match[1] });
    cursor = index + match[0].length;
  }

  const remainingText = content.slice(cursor);
  if (remainingText.trim()) blocks.push({ type: "text", text: remainingText });

  return blocks;
}
