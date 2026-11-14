import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue({}) }));

import { api } from "#lib/api";

import {
  createVideoToSummary,
  createVideoToTranscript,
  getJobTypes,
} from "./create";

describe("jobs create api", () => {
  beforeEach(() => {
    vi.mocked(api).mockClear();
  });

  it("when getting job types, should call /jobs/types", async () => {
    await getJobTypes();

    expect(api).toHaveBeenCalledWith("/jobs/types");
  });

  it("when creating a transcript job, should POST the url", async () => {
    await createVideoToTranscript({ url: "http://x/v.mp4" });

    expect(api).toHaveBeenCalledWith("/jobs/video-to-transcript", {
      method: "POST",
      body: JSON.stringify({ url: "http://x/v.mp4" }),
    });
  });

  it("when creating a summary job, should POST url, provider, model and thinking", async () => {
    const params = {
      url: "http://x/v.mp4",
      providerId: "ollama",
      modelId: "m",
      thinking: "off",
      detail: "detailed" as const,
    };

    await createVideoToSummary(params);

    expect(api).toHaveBeenCalledWith("/jobs/video-to-summary", {
      method: "POST",
      body: JSON.stringify(params),
    });
  });
});
