import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

vi.mock("./api", () => ({
  getBooks: vi.fn().mockResolvedValue([]),
  getBook: vi.fn().mockResolvedValue({ id: "b1" }),
  readBook: vi.fn().mockResolvedValue({}),
  searchBook: vi.fn().mockResolvedValue([]),
  createBook: vi.fn().mockResolvedValue({ id: "b1" }),
  updateBook: vi.fn().mockResolvedValue({ id: "b1" }),
  deleteBook: vi.fn().mockResolvedValue(undefined),
  setBookStructure: vi.fn().mockResolvedValue({ id: "b1" }),
  addBookChapter: vi.fn().mockResolvedValue({ id: "b1" }),
}));

import { createTestQueryClient } from "../../../test/utils";
import * as api from "./api";

import {
  useAddBookChapter,
  useBook,
  useBookReading,
  useBookSearch,
  useBooks,
  useCreateBook,
  useDeleteBook,
  useSetBookStructure,
  useUpdateBook,
} from "./hooks";

function setup() {
  const client = createTestQueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { wrapper, invalidate };
}

describe("books hooks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("when listing, should pass the document id", async () => {
    const { wrapper } = setup();

    renderHook(() => useBooks("d1"), { wrapper });

    await waitFor(() => expect(api.getBooks).toHaveBeenCalledWith("d1"));
  });

  it("when there is no id, should not fetch the book or the reading", () => {
    const { wrapper } = setup();

    renderHook(() => useBook(undefined), { wrapper });
    renderHook(() => useBookReading(undefined), { wrapper });

    expect(api.getBook).not.toHaveBeenCalled();
    expect(api.readBook).not.toHaveBeenCalled();
  });

  it("when the id exists, should fetch the book and the reading", async () => {
    const { wrapper } = setup();

    renderHook(() => useBook("b1"), { wrapper });
    renderHook(() => useBookReading("b1"), { wrapper });

    await waitFor(() => expect(api.getBook).toHaveBeenCalledWith("b1"));
    await waitFor(() => expect(api.readBook).toHaveBeenCalledWith("b1"));
  });

  it("when the query is shorter than 2 characters, should not search", () => {
    const { wrapper } = setup();

    renderHook(() => useBookSearch("b1", " a "), { wrapper });

    expect(api.searchBook).not.toHaveBeenCalled();
  });

  it("when the query has 2 or more characters, should search with it trimmed", async () => {
    const { wrapper } = setup();

    renderHook(() => useBookSearch("b1", "  docker "), { wrapper });

    await waitFor(() =>
      expect(api.searchBook).toHaveBeenCalledWith("b1", "docker"),
    );
  });

  it.each([
    ["create", () => useCreateBook(), { title: "T" }, "createBook"],
    [
      "update",
      () => useUpdateBook(),
      { id: "b1", input: { title: "N" } },
      "updateBook",
    ],
    ["delete", () => useDeleteBook(), "b1", "deleteBook"],
    [
      "structure",
      () => useSetBookStructure(),
      { id: "b1", modules: [] },
      "setBookStructure",
    ],
    [
      "chapter",
      () => useAddBookChapter(),
      { id: "b1", documentId: "d1" },
      "addBookChapter",
    ],
  ] as const)(
    "when %s succeeds, should call the api and invalidate the books",
    async (_name, hook, variables, fn) => {
      const { wrapper, invalidate } = setup();
      const { result } = renderHook(() => hook() as never, { wrapper });

      await act(async () => {
        await (
          result.current as { mutateAsync: (v: unknown) => Promise<unknown> }
        ).mutateAsync(variables);
      });

      expect(api[fn]).toHaveBeenCalled();
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["library", "books"],
      });
    },
  );
});
