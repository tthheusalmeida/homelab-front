import { normalizeKey } from "#lib/text";

export interface Heading {
  level: number;
  text: string;
  id: string;
}

/** `Ligações Químicas!` → `ligacoes-quimicas` (ids de âncora de títulos). */
export function slugifyHeading(text: string): string {
  return (
    normalizeKey(text)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "secao"
  );
}

/**
 * Gera ids únicos na ordem em que os títulos aparecem: o segundo título
 * igual vira `-2`, o terceiro `-3`. Usado pelo índice e pela renderização, que
 * precisam chegar aos mesmos ids.
 */
export function createHeadingIdGenerator(): (text: string) => string {
  const seen = new Map<string, number>();

  return (text) => {
    const base = slugifyHeading(text);
    const count = (seen.get(base) ?? 0) + 1;

    seen.set(base, count);

    return count === 1 ? base : `${base}-${count}`;
  };
}

/** Tira a marcação inline de um título (links, imagens, ênfase, código). */
function plainHeadingText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`~]/g, "")
    .trim();
}

interface ScannedHeading extends Heading {
  /** Linha (base 1) onde o título aparece. */
  line: number;
}

/** Todos os títulos (`#` a `######`) com linha e id, ignorando blocos de código. */
function scanHeadings(markdown: string): ScannedHeading[] {
  const nextId = createHeadingIdGenerator();
  const headings: ScannedHeading[] = [];
  let fence: string | null = null;

  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    const fenceMatch = line.match(/^\s*(```|~~~)/);

    if (fenceMatch) {
      fence = fence === null ? fenceMatch[1] : fence === fenceMatch[1] ? null : fence;
      continue;
    }

    if (fence !== null) {
      continue;
    }

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

    if (!match) {
      continue;
    }

    const text = plainHeadingText(match[2]);

    if (text === "") {
      continue;
    }

    headings.push({
      level: match[1].length,
      text,
      id: nextId(text),
      line: index + 1,
    });
  }

  return headings;
}

/** Títulos `#` a `###` do Markdown, para o sumário. */
export function extractHeadings(markdown: string): Heading[] {
  return scanHeadings(markdown)
    .filter((heading) => heading.level <= 3)
    .map(({ level, text, id }) => ({ level, text, id }));
}

/**
 * Id de cada título pela linha em que ele começa. A renderização consulta por
 * linha (em vez de contar títulos ao renderizar), então os ids batem com o
 * sumário mesmo se o React renderizar um componente mais de uma vez.
 */
export function headingIdsByLine(markdown: string): Map<number, string> {
  return new Map(
    scanHeadings(markdown).map((heading) => [heading.line, heading.id]),
  );
}
