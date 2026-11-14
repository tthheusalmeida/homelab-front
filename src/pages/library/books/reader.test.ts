import { afterEach, describe, expect, it, vi } from "vitest";

import {
  chapterElementId,
  goToElement,
  headingElementId,
  hitTargetId,
} from "./reader";
import type { BookSearchHit } from "./types";

const hit = (line: number): BookSearchHit => ({
  documentId: "d1",
  chapterTitle: "Docker",
  moduleId: "m1",
  moduleTitle: "M",
  line,
  snippet: "...",
});

const content =
  "# Docker\n\ntexto\n\n## Imagens\n\nlinha 6\n\n## Redes\n\nlinha 10";

describe("element ids", () => {
  it("when building ids, should prefix chapter and heading ids", () => {
    expect(chapterElementId("d1")).toBe("chapter-d1");
    expect(headingElementId("d1", "redes")).toBe("d1-redes");
  });
});

describe("hitTargetId", () => {
  it("when the hit is under a heading, should target the nearest heading above it", () => {
    expect(hitTargetId(hit(7), content)).toBe("d1-imagens");
    expect(hitTargetId(hit(10), content)).toBe("d1-redes");
  });

  it("when the hit is on a heading line, should target that heading", () => {
    expect(hitTargetId(hit(5), content)).toBe("d1-imagens");
  });

  it("when there is no heading above the hit, should target the chapter", () => {
    expect(hitTargetId(hit(1), "texto solto\n\n# Depois")).toBe("chapter-d1");
  });

  it("when the content has no headings, should target the chapter", () => {
    expect(hitTargetId(hit(3), "só texto")).toBe("chapter-d1");
  });
});

describe("goToElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("when the element exists, should scroll to it and highlight it for a moment", () => {
    vi.useFakeTimers();
    const element = document.createElement("h2");
    element.id = "alvo";
    element.scrollIntoView = vi.fn();
    document.body.appendChild(element);

    goToElement("alvo");

    expect(element.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(element).toHaveClass("bg-primary/15");

    vi.advanceTimersByTime(2000);

    expect(element).not.toHaveClass("bg-primary/15");
  });

  it("when the element does not exist, should do nothing", () => {
    expect(() => goToElement("nao-existe")).not.toThrow();
  });
});
