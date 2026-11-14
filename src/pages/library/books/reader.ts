import { headingIdsByLine } from "#lib/markdown";

import type { BookSearchHit } from "./types";

/** `id` do bloco de um capítulo na leitura contínua. */
export const chapterElementId = (documentId: string) => `chapter-${documentId}`;

/** `id` de um título dentro de um capítulo (mesmo `idPrefix` do texto). */
export const headingElementId = (documentId: string, headingId: string) =>
  `${documentId}-${headingId}`;

/**
 * Para onde rolar ao clicar num resultado: o título mais próximo acima da
 * linha encontrada; sem título antes dela, o começo do capítulo.
 */
export function hitTargetId(hit: BookSearchHit, content: string): string {
  let best: { line: number; id: string } | null = null;

  for (const [line, id] of headingIdsByLine(content)) {
    if (line <= hit.line && (best === null || line > best.line)) {
      best = { line, id };
    }
  }

  return best
    ? headingElementId(hit.documentId, best.id)
    : chapterElementId(hit.documentId);
}
