import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue({}) }));

import { api } from "#lib/api";

import { resetBookProgress, saveBookPosition, setChapterRead } from "./api";

describe("books api — progress", () => {
  beforeEach(() => vi.mocked(api).mockClear());

  it("when marking a chapter as read, should PUT the flag with the ids encoded", async () => {
    await setChapterRead("b 1", "d/1", true);

    expect(api).toHaveBeenCalledWith(
      "/library/books/b%201/chapters/d%2F1/read",
      {
        method: "PUT",
        body: JSON.stringify({ read: true }),
      },
    );
  });

  it("when unmarking, should send read false", async () => {
    await setChapterRead("b1", "d1", false);

    expect(api).toHaveBeenCalledWith("/library/books/b1/chapters/d1/read", {
      method: "PUT",
      body: JSON.stringify({ read: false }),
    });
  });

  it("when resetting the progress, should DELETE the progress of that book", async () => {
    await resetBookProgress("b 1");

    expect(api).toHaveBeenCalledWith("/library/books/b%201/progress", {
      method: "DELETE",
    });
  });

  it("when saving the position, should PUT the chapter and the element", async () => {
    await saveBookPosition("b1", { documentId: "d1", elementId: "d1-intro" });

    expect(api).toHaveBeenCalledWith("/library/books/b1/position", {
      method: "PUT",
      body: JSON.stringify({ documentId: "d1", elementId: "d1-intro" }),
    });
  });
});
