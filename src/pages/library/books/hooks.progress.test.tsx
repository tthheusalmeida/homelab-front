import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";

vi.mock("./api", () => ({
  setChapterRead: vi.fn().mockResolvedValue({ id: "b1" }),
  saveBookPosition: vi.fn().mockResolvedValue({ id: "b1" }),
  resetBookProgress: vi.fn().mockResolvedValue({ id: "b1" }),
}));

import { createTestQueryClient } from "../../../test/utils";
import * as api from "./api";

import {
  useResetBookProgress,
  useSaveBookPosition,
  useSetChapterRead,
} from "./hooks";

function setup() {
  const client = createTestQueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { wrapper, invalidate };
}

describe("books hooks — progress", () => {
  beforeEach(() => vi.clearAllMocks());

  it("when a chapter is marked, should call the api and refresh all the books", async () => {
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useSetChapterRead(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "b1",
        documentId: "d1",
        read: true,
      });
    });

    expect(api.setChapterRead).toHaveBeenCalledWith("b1", "d1", true);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library", "books"] });
  });

  it("when the progress is reset, should call the api and refresh all the books", async () => {
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useResetBookProgress(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("b1");
    });

    expect(api.resetBookProgress).toHaveBeenCalledWith("b1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library", "books"] });
  });

  it("when the position is saved, should call the api and refresh only the shelf list", async () => {
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useSaveBookPosition(), { wrapper });
    const position = { documentId: "d1", elementId: "d1-x" };

    await act(async () => {
      await result.current.mutateAsync({ id: "b1", position });
    });

    expect(api.saveBookPosition).toHaveBeenCalledWith("b1", position);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["library", "books", "list"],
    });
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["library", "books"],
    });
  });
});
