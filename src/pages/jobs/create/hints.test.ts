import { describe, expect, it } from "vitest";

import { buildDocumentHints } from "./hints";

describe("buildDocumentHints", () => {
  it("when everything is empty, should return an empty object", () => {
    expect(buildDocumentHints({ title: "", category: [], tags: [] })).toEqual(
      {},
    );
  });

  it("when the title is only spaces, should leave it out", () => {
    expect(
      buildDocumentHints({ title: "   ", category: [], tags: [] }),
    ).toEqual({});
  });

  it("when the title has spaces around, should send it trimmed", () => {
    expect(
      buildDocumentHints({ title: "  Aula 3 ", category: [], tags: [] }),
    ).toEqual({ title: "Aula 3" });
  });

  it("when the category has blank levels, should drop them", () => {
    expect(
      buildDocumentHints({
        title: "",
        category: ["Tecnologia", "  ", "DevOps"],
        tags: [],
      }),
    ).toEqual({ category: ["Tecnologia", "DevOps"] });
  });

  it("when the category has only blank levels, should leave it out", () => {
    expect(
      buildDocumentHints({ title: "", category: [" "], tags: [] }),
    ).toEqual({});
  });

  it("when everything is filled, should send title, category and tags", () => {
    expect(
      buildDocumentHints({
        title: "T",
        category: ["A", "B"],
        tags: ["x", "y"],
      }),
    ).toEqual({ title: "T", category: ["A", "B"], tags: ["x", "y"] });
  });
});
