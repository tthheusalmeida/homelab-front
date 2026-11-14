import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue([]) }));

import { api } from "#lib/api";

import { createWrapper } from "../../../test/utils";
import { fetchJobs } from "./api/track";
import { useJobs } from "./hooks/useJobs";

describe("jobs track", () => {
  it("when fetching jobs, should call /jobs", async () => {
    await fetchJobs();

    expect(api).toHaveBeenCalledWith("/jobs");
  });

  it("when useJobs mounts, should load the jobs list", async () => {
    const { result } = renderHook(() => useJobs(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
