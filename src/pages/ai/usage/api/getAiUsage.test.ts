import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue({}) }));

import { api } from "#lib/api";

import { getAiUsage } from "./getAiUsage";

describe("getAiUsage", () => {
  beforeEach(() => {
    vi.mocked(api).mockClear();
  });

  it("when no params are given, should call /ai/usage without query string", async () => {
    await getAiUsage();

    expect(api).toHaveBeenCalledWith("/ai/usage");
  });

  it("when provider is given, should send it as query param", async () => {
    await getAiUsage({ provider: "gemini" });

    expect(api).toHaveBeenCalledWith("/ai/usage?provider=gemini");
  });
});
