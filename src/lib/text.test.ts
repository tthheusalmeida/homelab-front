import { describe, expect, it } from "vitest";

import { normalizeKey } from "./text";

describe("normalizeKey", () => {
  it("when text has accents, case and extra spaces, should normalize all of them", () => {
    expect(normalizeKey("  Ciência   da  Computação ")).toBe(
      "ciencia da computacao",
    );
  });

  it("when two names differ only by case or accent, should produce the same key", () => {
    expect(normalizeKey("Química")).toBe(normalizeKey("quimica"));
  });

  it("when text is empty, should return an empty string", () => {
    expect(normalizeKey("")).toBe("");
  });
});
