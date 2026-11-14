import type { BookReading } from "./types";

/** Velocidade de leitura usada na estimativa (palavras por minuto). */
export const WORDS_PER_MINUTE = 200;

export interface BookStats {
  modules: number;
  chapters: number;
  words: number;
  /** Tempo de leitura estimado, em minutos (mínimo 1 se houver texto). */
  minutes: number;
  /** Palavras de cada capítulo, por id de documento. */
  wordsByChapter: Map<string, number>;
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Minutos de leitura estimados para essa quantidade de palavras (mínimo 1 se houver texto). */
export function minutesToRead(words: number): number {
  return words <= 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Números do livro a partir do texto lido (só capítulos disponíveis). */
export function bookStats(reading: BookReading): BookStats {
  const wordsByChapter = new Map<string, number>();
  let words = 0;
  let chapters = 0;

  for (const module of reading.modules) {
    for (const chapter of module.chapters) {
      const count = countWords(chapter.content);

      wordsByChapter.set(chapter.documentId, count);
      words += count;
      chapters += 1;
    }
  }

  return {
    modules: reading.modules.length,
    chapters,
    words,
    minutes: minutesToRead(words),
    wordsByChapter,
  };
}

/** `1 h 20 min`, `45 min` ou `—` quando não há texto. */
export function formatReadingTime(minutes: number): string {
  if (minutes <= 0) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${rest} min`;
  }

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
