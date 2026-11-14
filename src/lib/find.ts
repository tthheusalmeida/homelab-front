export interface TextRange {
  start: number;
  end: number;
}

/** Tira o acento e a caixa de UM caractere (para a posição não se deslocar). */
function fold(char: string): string {
  return char.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Palavras da consulta, sem acento nem caixa, sem repetir e com 2+ letras. */
export function searchTerms(query: string): string[] {
  const words = query
    .split(/\s+/)
    .map((word) => [...word].map(fold).join(""))
    .filter((word) => word.length >= 2);

  return [...new Set(words)];
}

/**
 * Posições (no texto original) de cada ocorrência de qualquer termo, ignorando
 * acento e caixa. Ocorrências que se sobrepõem viram uma só.
 */
export function findMatches(text: string, terms: string[]): TextRange[] {
  if (terms.length === 0 || text === "") {
    return [];
  }

  let folded = "";
  const origin: number[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const piece = fold(text[index]);

    for (let offset = 0; offset < piece.length; offset += 1) {
      folded += piece[offset];
      origin.push(index);
    }
  }

  const found: TextRange[] = [];

  for (const term of terms) {
    let at = folded.indexOf(term);

    while (at !== -1) {
      found.push({
        start: origin[at],
        end: origin[at + term.length - 1] + 1,
      });
      at = folded.indexOf(term, at + 1);
    }
  }

  found.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: TextRange[] = [];

  for (const range of found) {
    const last = merged[merged.length - 1];

    if (last && range.start < last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}
