import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../api/getAiUsage", () => ({ getAiUsage: vi.fn() }));

import { createWrapper } from "../../../../test/utils";
import { getAiUsage } from "../api/getAiUsage";

import { useAiUsage } from "./useAiUsage";

describe("useAiUsage", () => {
  it("when mounted with a provider, should fetch usage with the params", async () => {
    vi.mocked(getAiUsage).mockResolvedValue({} as never);

    const { result } = renderHook(() => useAiUsage({ provider: "ollama" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAiUsage).toHaveBeenCalledWith({ provider: "ollama" });
  });
});
