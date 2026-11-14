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

/** Rola até o elemento e destaca por um instante (para onde o leitor foi levado). */
export function goToElement(elementId: string) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.scrollIntoView?.({ behavior: "smooth", block: "start" });
  element.classList.add("bg-primary/15", "rounded-md");
  window.setTimeout(
    () => element.classList.remove("bg-primary/15", "rounded-md"),
    1800,
  );
}
