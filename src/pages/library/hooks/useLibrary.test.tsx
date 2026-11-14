import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

vi.mock("../api/library", () => ({
  getDocuments: vi.fn(),
  getDocument: vi.fn(),
  getInbox: vi.fn(),
  getCategories: vi.fn(),
  getTags: vi.fn(),
  getIndexStatus: vi.fn(),
  reindex: vi.fn(),
  publishDocument: vi.fn(),
  archiveDocument: vi.fn(),
  discardDocument: vi.fn(),
  createArticle: vi.fn(),
  suggestClassification: vi.fn(),
  updateDocument: vi.fn(),
}));

import { createTestQueryClient } from "../../../test/utils";
import * as library from "../api/library";

import {
  useArchiveDocument,
  useCategories,
  useCreateArticle,
  useDiscardDocument,
  useDocument,
  useDocuments,
  useIndexStatus,
  useInbox,
  usePublishDocument,
  useReindex,
  useSuggestClassification,
  useTags,
  useUpdateDocument,
} from "./useLibrary";

function setup() {
  const client = createTestQueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { wrapper, invalidate };
}

describe("library query hooks", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("when useDocuments mounts, should fetch with the filters", async () => {
    vi.mocked(library.getDocuments).mockResolvedValue([]);
    const { wrapper } = setup();

    const { result } = renderHook(
      () => useDocuments({ q: "x", category: ["A"] }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(library.getDocuments).toHaveBeenCalledWith({
      q: "x",
      category: ["A"],
    });
  });

  it("when the filters change, should fetch again with the new filters", async () => {
    vi.mocked(library.getDocuments).mockResolvedValue([]);
    const { wrapper } = setup();

    const { result, rerender } = renderHook(({ q }) => useDocuments({ q }), {
      wrapper,
      initialProps: { q: "a" },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ q: "b" });

    await waitFor(() =>
      expect(library.getDocuments).toHaveBeenLastCalledWith({ q: "b" }),
    );
  });

  it("when useDocument has no id, should not fetch", () => {
    const { wrapper } = setup();

    renderHook(() => useDocument(undefined), { wrapper });

    expect(library.getDocument).not.toHaveBeenCalled();
  });

  it("when useDocument has an id, should fetch it", async () => {
    vi.mocked(library.getDocument).mockResolvedValue({
      meta: {} as never,
      content: "x",
    });
    const { wrapper } = setup();

    const { result } = renderHook(() => useDocument("id1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(library.getDocument).toHaveBeenCalledWith("id1");
  });

  it("when the simple query hooks mount, should call their api functions", async () => {
    vi.mocked(library.getInbox).mockResolvedValue([]);
    vi.mocked(library.getCategories).mockResolvedValue([]);
    vi.mocked(library.getTags).mockResolvedValue([]);
    vi.mocked(library.getIndexStatus).mockResolvedValue({
      total: 0,
      errors: [],
    });
    const { wrapper } = setup();

    renderHook(
      () => {
        useInbox();
        useCategories();
        useTags();
        useIndexStatus();
      },
      { wrapper },
    );

    await waitFor(() => {
      expect(library.getInbox).toHaveBeenCalled();
      expect(library.getCategories).toHaveBeenCalled();
      expect(library.getTags).toHaveBeenCalled();
      expect(library.getIndexStatus).toHaveBeenCalled();
    });
  });
});

describe("library mutation hooks", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("when publishing, should call the api and invalidate all library queries", async () => {
    vi.mocked(library.publishDocument).mockResolvedValue({
      meta: {} as never,
      content: "",
    });
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => usePublishDocument(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "id1",
        input: { category: ["A"] },
      });
    });

    expect(library.publishDocument).toHaveBeenCalledWith("id1", {
      category: ["A"],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when archiving, should call the api and invalidate", async () => {
    vi.mocked(library.archiveDocument).mockResolvedValue({
      meta: {} as never,
      content: "",
    });
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useArchiveDocument(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("id1");
    });

    expect(library.archiveDocument).toHaveBeenCalledWith("id1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when discarding, should call the api and invalidate", async () => {
    vi.mocked(library.discardDocument).mockResolvedValue(undefined);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useDiscardDocument(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("id1");
    });

    expect(library.discardDocument).toHaveBeenCalledWith("id1");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when creating an article, should call the api and invalidate", async () => {
    vi.mocked(library.createArticle).mockResolvedValue({
      meta: {} as never,
      content: "",
    });
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useCreateArticle(), { wrapper });
    const input = { title: "T", category: ["A"], content: "c" };

    await act(async () => {
      await result.current.mutateAsync(input);
    });

    expect(vi.mocked(library.createArticle).mock.calls[0][0]).toEqual(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when reindexing, should call the api and invalidate", async () => {
    vi.mocked(library.reindex).mockResolvedValue({ indexed: 0, errors: [] });
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useReindex(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(library.reindex).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when updating, should call the api and invalidate the library queries", async () => {
    vi.mocked(library.updateDocument).mockResolvedValue({
      meta: {} as never,
      content: "",
    });
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useUpdateDocument(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        id: "id1",
        input: { title: "T" },
      });
    });

    expect(library.updateDocument).toHaveBeenCalledWith("id1", { title: "T" });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["library"] });
  });

  it("when suggesting, should call the api with id and model and not invalidate", async () => {
    const suggestion = {
      title: "T",
      category: ["A"],
      tags: [],
      model: "gemini-3.1-flash-lite",
    };
    vi.mocked(library.suggestClassification).mockResolvedValue(suggestion);
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useSuggestClassification(), {
      wrapper,
    });

    let returned: unknown;

    await act(async () => {
      returned = await result.current.mutateAsync({
        id: "id1",
        modelId: "gemini-3.1-flash-lite",
      });
    });

    expect(library.suggestClassification).toHaveBeenCalledWith(
      "id1",
      "gemini-3.1-flash-lite",
    );
    expect(returned).toEqual(suggestion);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("when a mutation fails, should not invalidate the queries", async () => {
    vi.mocked(library.archiveDocument).mockRejectedValue(new Error("x"));
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useArchiveDocument(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("id1").catch(() => {});
    });

    expect(invalidate).not.toHaveBeenCalled();
  });
});
