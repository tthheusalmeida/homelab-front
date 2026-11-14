import { describe, expect, it } from "vitest";

import {
  DEFAULT_COVER_COLOR,
  bookCoverColors,
  gradientOf,
  isValidCoverImageUrl,
} from "./cover";

describe("cover colors", () => {
  it("when listing the colors, should offer the six options with a label, gradient and swatch", () => {
    expect(bookCoverColors.map((color) => color.id)).toEqual([
      "blue",
      "emerald",
      "violet",
      "amber",
      "rose",
      "slate",
    ]);
    expect(
      bookCoverColors.every(
        (color) => color.label && color.gradient && color.swatch,
      ),
    ).toBe(true);
  });

  it("when asking for a gradient, should return the one of that color", () => {
    expect(gradientOf("rose")).toBe("from-rose-600 to-rose-900");
  });

  it("when the color is missing, should fall back to the first gradient", () => {
    expect(gradientOf(undefined)).toBe(gradientOf(DEFAULT_COVER_COLOR));
  });
});

describe("isValidCoverImageUrl", () => {
  it.each(["", "   ", "http://a.com/x.png", " https://a.com/x.png "])(
    "when the url is %p, should be valid",
    (value) => {
      expect(isValidCoverImageUrl(value)).toBe(true);
    },
  );

  it.each(["ftp://a.com/x.png", "javascript:alert(1)", "não é url", "a.com/x"])(
    "when the url is %p, should be invalid",
    (value) => {
      expect(isValidCoverImageUrl(value)).toBe(false);
    },
  );
});
