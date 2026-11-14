import type { ReactNode } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";

vi.mock("../api/library", () => ({ reindex: vi.fn() }));

import { createTestQueryClient } from "../../../test/utils";
import * as library from "../api/library";

import { MIN_SYNC_INTERVAL_MS, useLibrarySync } from "./useLibrarySync";

function setup() {
  const client = createTestQueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { wrapper, invalidate };
}

const flush = () => act(async () => {});

describe("useLibrarySync", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.mocked(library.reindex).mockReset();
    vi.mocked(library.reindex).mockResolvedValue({ indexed: 1, errors: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("when mounted, should reindex and refresh the library queries", async () => {
    const { wrapper, invalidate } = setup();

    renderHook(() => useLibrarySync(), { wrapper });
    await flush();

    expect(library.reindex).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when the window regains focus after the minimum interval, should sync again", async () => {
    const { wrapper } = setup();

    renderHook(() => useLibrarySync(), { wrapper });
    await flush();

    vi.setSystemTime(Date.now() + MIN_SYNC_INTERVAL_MS + 1);
    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(library.reindex).toHaveBeenCalledTimes(2);
  });

  it("when the window regains focus too soon, should not sync again", async () => {
    const { wrapper } = setup();

    renderHook(() => useLibrarySync(), { wrapper });
    await flush();

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(library.reindex).toHaveBeenCalledTimes(1);
  });

  it("when the reindex fails, should not refresh and should not throw", async () => {
    vi.mocked(library.reindex).mockRejectedValue(new Error("fora do ar"));
    const { wrapper, invalidate } = setup();

    renderHook(() => useLibrarySync(), { wrapper });
    await flush();

    expect(invalidate).not.toHaveBeenCalled();
  });

  it("when unmounted, should stop listening to focus", async () => {
    const { wrapper } = setup();
    const { unmount } = renderHook(() => useLibrarySync(), { wrapper });
    await flush();

    unmount();
    vi.setSystemTime(Date.now() + MIN_SYNC_INTERVAL_MS + 1);
    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(library.reindex).toHaveBeenCalledTimes(1);
  });
});
