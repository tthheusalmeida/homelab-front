import { describe, expect, it } from "vitest";

import {
  DEFAULT_SUMMARY_DETAIL,
  isSummaryDetail,
  summaryDetailOptions,
} from "./summary-detail";

describe("summary detail", () => {
  it("when no level is chosen, should default to detailed", () => {
    expect(DEFAULT_SUMMARY_DETAIL).toBe("detailed");
  });

  it("when listing the options, should offer brief, detailed and study with a description", () => {
    expect(summaryDetailOptions.map((option) => option.id)).toEqual([
      "brief",
      "detailed",
      "study",
    ]);
    expect(summaryDetailOptions.every((option) => option.description)).toBe(
      true,
    );
  });

  it.each(["brief", "detailed", "study"])(
    "when the value is %s, should accept it",
    (value) => {
      expect(isSummaryDetail(value)).toBe(true);
    },
  );

  it.each(["", "huge", null, undefined])(
    "when the value is %p, should reject it",
    (value) => {
      expect(isSummaryDetail(value)).toBe(false);
    },
  );
});
