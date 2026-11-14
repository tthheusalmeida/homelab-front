import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("when given falsy values, should ignore them", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("when classes conflict in tailwind, should keep the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
