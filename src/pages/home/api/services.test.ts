import { afterEach, describe, expect, it, vi } from "vitest";

import { checkService } from "./services";

describe("checkService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("when the service responds ok, should return the health json", async () => {
    const body = { service: "system", description: "d", checks: [] };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: () => Promise.resolve(body) }),
    );

    await expect(checkService("http://x/health")).resolves.toEqual(body);
  });

  it("when the service responds with an error status, should throw naming url and status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await expect(checkService("http://x/health")).rejects.toThrow(
      /http:\/\/x\/health.*503/,
    );
  });
});
