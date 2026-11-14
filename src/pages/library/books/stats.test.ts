import { describe, expect, it } from "vitest";

import {
  WORDS_PER_MINUTE,
  bookStats,
  countWords,
  formatReadingTime,
  minutesToRead,
} from "./stats";
import type { BookReading } from "./types";

const chapter = (documentId: string, content: string) => ({
  documentId,
  title: documentId,
  category: [],
  available: true,
  content,
});

const reading = (modules: BookReading["modules"]): BookReading => ({
  book: {
    id: "b1",
    title: "T",
    kind: "pos",
    description: "",
    subtitle: "",
    coverColor: "blue",
    coverImageUrl: "",
    readDocumentIds: [],
    lastPosition: null,
    completedAt: null,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z",
  },
  modules,
});

describe("countWords", () => {
  it("when the text has extra spaces and line breaks, should count only words", () => {
    expect(countWords("  um  dois\n\ntrês ")).toBe(3);
  });

  it("when the text is empty, should be zero", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });
});

describe("bookStats", () => {
  it("when the book has chapters, should total modules, chapters, words and per-chapter words", () => {
    const stats = bookStats(
      reading([
        { id: "m1", title: "M1", chapters: [chapter("a", "um dois três")] },
        {
          id: "m2",
          title: "",
          chapters: [chapter("b", "quatro cinco"), chapter("c", "seis")],
        },
      ]),
    );

    expect(stats).toMatchObject({ modules: 2, chapters: 3, words: 6 });
    expect(stats.wordsByChapter.get("b")).toBe(2);
  });

  it("when the book has words, should estimate the minutes rounding up", () => {
    const text = "palavra ".repeat(WORDS_PER_MINUTE + 1);

    expect(
      bookStats(
        reading([{ id: "m", title: "", chapters: [chapter("a", text)] }]),
      ).minutes,
    ).toBe(2);
  });

  it("when the text is tiny, should estimate at least one minute", () => {
    expect(
      bookStats(
        reading([{ id: "m", title: "", chapters: [chapter("a", "oi")] }]),
      ).minutes,
    ).toBe(1);
  });

  it("when there are no chapters, should be all zeros", () => {
    const stats = bookStats(reading([{ id: "m", title: "", chapters: [] }]));

    expect(stats).toMatchObject({ chapters: 0, words: 0, minutes: 0 });
  });
});

describe("formatReadingTime", () => {
  it.each([
    [0, "—"],
    [-3, "—"],
    [45, "45 min"],
    [60, "1 h"],
    [80, "1 h 20 min"],
  ])("when the minutes are %p, should show %s", (minutes, text) => {
    expect(formatReadingTime(minutes)).toBe(text);
  });
});

describe("minutesToRead", () => {
  it.each([
    [0, 0],
    [-5, 0],
    [1, 1],
    [WORDS_PER_MINUTE, 1],
    [WORDS_PER_MINUTE + 1, 2],
  ])("when there are %p words, should take %p minute(s)", (words, minutes) => {
    expect(minutesToRead(words)).toBe(minutes);
  });
});
