import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

vi.mock("../api/create", () => ({
  getJobTypes: vi.fn(),
  createVideoToTranscript: vi.fn(),
  createVideoToSummary: vi.fn(),
}));

import { createWrapper } from "../../../../test/utils";
import {
  createVideoToSummary,
  createVideoToTranscript,
  getJobTypes,
} from "../api/create";

import { useCreateVideoToSummary } from "./useCreateVideoToSummary";
import { useCreateVideoToTranscript } from "./useCreateVideoToTranscript";
import { useJobTypes } from "./useJobsTypes";

describe("jobs create hooks", () => {
  it("when useJobTypes mounts, should fetch the job types", async () => {
    vi.mocked(getJobTypes).mockResolvedValue([
      { type: "t", label: "T", description: "d" },
    ]);

    const { result } = renderHook(() => useJobTypes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("when the transcript mutation runs, should call createVideoToTranscript", async () => {
    vi.mocked(createVideoToTranscript).mockResolvedValue({
      id: "1",
      status: "pending",
    });
    const { result } = renderHook(() => useCreateVideoToTranscript(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ url: "http://x" });
    });

    expect(vi.mocked(createVideoToTranscript).mock.calls[0][0]).toEqual({
      url: "http://x",
    });
  });

  it("when the summary mutation runs, should call createVideoToSummary", async () => {
    vi.mocked(createVideoToSummary).mockResolvedValue({
      id: "1",
      status: "pending",
    });
    const { result } = renderHook(() => useCreateVideoToSummary(), {
      wrapper: createWrapper(),
    });
    const params = {
      url: "http://x",
      providerId: "p",
      modelId: "m",
      thinking: "off",
      detail: "detailed" as const,
    };

    await act(async () => {
      await result.current.mutateAsync(params);
    });

    expect(vi.mocked(createVideoToSummary).mock.calls[0][0]).toEqual(params);
  });
});
