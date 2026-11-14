import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatServiceName,
} from "./format";

describe("formatDuration", () => {
  it("when ms is below 1000, should return milliseconds", () => {
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(999)).toBe("999ms");
  });

  it("when ms is below one minute, should return seconds", () => {
    expect(formatDuration(1_000)).toBe("1s");
    expect(formatDuration(1_500)).toBe("1.5s");
  });

  it("when ms is below one hour, should return minutes", () => {
    expect(formatDuration(60_000)).toBe("1m");
    expect(formatDuration(90_000)).toBe("1.5m");
  });

  it("when ms is one hour or more, should return hours", () => {
    expect(formatDuration(3_600_000)).toBe("1h");
    expect(formatDuration(5_400_000)).toBe("1.5h");
  });

  it("when the value has many decimals, should round to two places", () => {
    expect(formatDuration(1_234)).toBe("1.23s");
  });
});

describe("formatNumber", () => {
  it("when value is below 1000, should return it as is", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });

  it("when value is in the thousands, should use K", () => {
    expect(formatNumber(1_000)).toBe("1K");
    expect(formatNumber(1_500)).toBe("1.5K");
  });

  it("when value is in the millions, should use M", () => {
    expect(formatNumber(2_500_000)).toBe("2.5M");
  });

  it("when value is in the billions, should use B", () => {
    expect(formatNumber(3_000_000_000)).toBe("3B");
  });
});

describe("formatDate", () => {
  it("when given a date-only string, should not shift the day by timezone", () => {
    expect(formatDate("2026-03-05")).toBe("05/03/2026");
  });

  it("when given a Date, should format as dd/mm/yyyy", () => {
    expect(formatDate(new Date(2026, 0, 31))).toBe("31/01/2026");
  });
});

describe("formatDateTime", () => {
  it("when given a date, should include date and time in pt-BR", () => {
    const result = formatDateTime(new Date(2026, 0, 31, 14, 5));

    expect(result).toMatch(/31\/01\/(20)?26/);
    expect(result).toContain("14:05");
  });
});

describe("formatServiceName", () => {
  it("when name is api, should return API", () => {
    expect(formatServiceName("api")).toBe("API");
  });

  it("when name is unknown, should capitalize the first letter", () => {
    expect(formatServiceName("ollama")).toBe("Ollama");
  });
});
