import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue([]) }));

import { api } from "#lib/api";

import { getAiModels, getAiProviders, getAiThinkingOptions } from "./chat";

describe("chat api", () => {
  beforeEach(() => {
    vi.mocked(api).mockClear();
  });

  it("when getting providers, should call /ai/providers", async () => {
    await getAiProviders();

    expect(api).toHaveBeenCalledWith("/ai/providers");
  });

  it("when getting models, should call the provider models endpoint", async () => {
    await getAiModels("gemini");

    expect(api).toHaveBeenCalledWith("/ai/providers/gemini/models");
  });

  it("when getting thinking options, should send provider and model as query params", async () => {
    await getAiThinkingOptions("ollama", "qwen3.5:8b");

    expect(api).toHaveBeenCalledWith(
      "/ai/thinking?providerId=ollama&modelId=qwen3.5%3A8b",
    );
  });
});
