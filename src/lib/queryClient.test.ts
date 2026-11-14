import { describe, expect, it } from "vitest";

import { queryClient } from "./queryClient";

describe("queryClient", () => {
  it("when reading default options, should use 30s stale time and a single retry", () => {
    const options = queryClient.getDefaultOptions().queries;

    expect(options?.staleTime).toBe(30_000);
    expect(options?.retry).toBe(1);
  });
});
