import { describe, expect, it } from "vitest";

import {
  createHeadingIdGenerator,
  extractHeadings,
  headingIdsByLine,
  slugifyHeading,
} from "./markdown";

describe("slugifyHeading", () => {
  it("when the text has accents, spaces and punctuation, should make a lowercase hyphenated slug", () => {
    expect(slugifyHeading("Ligações Químicas!")).toBe("ligacoes-quimicas");
  });

  it("when the text has no letters or digits, should fall back to a default", () => {
    expect(slugifyHeading("???")).toBe("secao");
  });
});

describe("createHeadingIdGenerator", () => {
  it("when a title repeats, should number the next ones", () => {
    const next = createHeadingIdGenerator();

    expect([next("Intro"), next("Intro"), next("Intro")]).toEqual([
      "intro",
      "intro-2",
      "intro-3",
    ]);
  });

  it("when two generators are used, should count independently", () => {
    const a = createHeadingIdGenerator();
    const b = createHeadingIdGenerator();

    a("X");

    expect(b("X")).toBe("x");
  });
});

describe("extractHeadings", () => {
  it("when the text has no headings, should return an empty list", () => {
    expect(extractHeadings("só texto\n\noutro parágrafo")).toEqual([]);
  });

  it("when there are headings from level 1 to 3, should return level, text and id", () => {
    expect(extractHeadings("# Um\n\n## Dois\n\n### Três")).toEqual([
      { level: 1, text: "Um", id: "um" },
      { level: 2, text: "Dois", id: "dois" },
      { level: 3, text: "Três", id: "tres" },
    ]);
  });

  it("when a heading is deeper than level 3, should leave it out of the list", () => {
    expect(extractHeadings("## A\n#### Fundo\n## B").map((h) => h.text)).toEqual(
      ["A", "B"],
    );
  });

  it("when a deep heading shares a title with a later one, should keep ids in sync with the rendering", () => {
    const headings = extractHeadings("#### Repetido\n## Repetido");

    expect(headings).toEqual([{ level: 2, text: "Repetido", id: "repetido-2" }]);
  });

  it("when titles repeat, should give them unique ids", () => {
    expect(extractHeadings("## Passo\n## Passo").map((h) => h.id)).toEqual([
      "passo",
      "passo-2",
    ]);
  });

  it("when a heading has markdown formatting, should show plain text", () => {
    expect(
      extractHeadings("## **Negrito** e `código` e [link](https://x.com)")[0]
        .text,
    ).toBe("Negrito e código e link");
  });

  it("when a heading has an image, should use its alt text", () => {
    expect(extractHeadings("## ![Logo](https://x.com/a.png) Marca")[0].text).toBe(
      "Logo Marca",
    );
  });

  it("when a heading has closing hashes, should drop them", () => {
    expect(extractHeadings("## Título ##")[0].text).toBe("Título");
  });

  it("when a line inside a code block starts with #, should not count it", () => {
    const markdown = "## Real\n\n```bash\n# comentário\n```\n\n## Outro";

    expect(extractHeadings(markdown).map((h) => h.text)).toEqual([
      "Real",
      "Outro",
    ]);
  });

  it("when a tilde fence is used, should also ignore its content", () => {
    expect(
      extractHeadings("~~~\n# dentro\n~~~\n# fora").map((h) => h.text),
    ).toEqual(["fora"]);
  });

  it("when # has no space after it or is empty, should not be a heading", () => {
    expect(extractHeadings("#semespaco\n#\n## ")).toEqual([]);
  });

  it("when the text has Windows line breaks, should still find the headings", () => {
    expect(extractHeadings("# A\r\n\r\n## B\r\n").map((h) => h.text)).toEqual([
      "A",
      "B",
    ]);
  });
});

describe("headingIdsByLine", () => {
  it("when the text has headings, should map each start line to its id", () => {
    const map = headingIdsByLine("# A\n\ntexto\n\n## A");

    expect(map.get(1)).toBe("a");
    expect(map.get(5)).toBe("a-2");
    expect(map.get(3)).toBeUndefined();
  });

  it("when a heading is inside a code block, should not map it", () => {
    expect(headingIdsByLine("```\n# no\n```").size).toBe(0);
  });
});
