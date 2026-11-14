import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue({}) }));

import { api } from "#lib/api";

import {
  addBookChapter,
  createBook,
  deleteBook,
  getBook,
  getBooks,
  readBook,
  searchBook,
  setBookStructure,
  updateBook,
} from "./api";

describe("books api", () => {
  beforeEach(() => vi.mocked(api).mockClear());

  it("when listing without a document, should call the plain list", async () => {
    await getBooks();

    expect(api).toHaveBeenCalledWith("/library/books");
  });

  it("when listing for a document, should send its id encoded", async () => {
    await getBooks("a/b");

    expect(api).toHaveBeenCalledWith("/library/books?documentId=a%2Fb");
  });

  it("when getting and reading a book, should encode the id", async () => {
    await getBook("x y");
    await readBook("x y");

    expect(api).toHaveBeenNthCalledWith(1, "/library/books/x%20y");
    expect(api).toHaveBeenNthCalledWith(2, "/library/books/x%20y/read");
  });

  it("when creating, should POST the input", async () => {
    await createBook({ title: "T", kind: "pos" });

    expect(api).toHaveBeenCalledWith("/library/books", {
      method: "POST",
      body: JSON.stringify({ title: "T", kind: "pos" }),
    });
  });

  it("when updating, should PATCH the input", async () => {
    await updateBook("b1", { title: "N" });

    expect(api).toHaveBeenCalledWith("/library/books/b1", {
      method: "PATCH",
      body: JSON.stringify({ title: "N" }),
    });
  });

  it("when deleting, should DELETE", async () => {
    await deleteBook("b1");

    expect(api).toHaveBeenCalledWith("/library/books/b1", {
      method: "DELETE",
    });
  });

  it("when saving the structure, should PUT the modules", async () => {
    const modules = [{ id: "m1", title: "M", documentIds: ["a"] }];

    await setBookStructure("b1", modules);

    expect(api).toHaveBeenCalledWith("/library/books/b1/structure", {
      method: "PUT",
      body: JSON.stringify({ modules }),
    });
  });

  it("when adding a chapter, should send the module only when given", async () => {
    await addBookChapter("b1", "d1");
    await addBookChapter("b1", "d1", "m1");

    expect(api).toHaveBeenNthCalledWith(1, "/library/books/b1/chapters", {
      method: "POST",
      body: JSON.stringify({ documentId: "d1" }),
    });
    expect(api).toHaveBeenNthCalledWith(2, "/library/books/b1/chapters", {
      method: "POST",
      body: JSON.stringify({ documentId: "d1", moduleId: "m1" }),
    });
  });

  it("when searching, should encode the query", async () => {
    await searchBook("b1", "imagem docker");

    expect(api).toHaveBeenCalledWith(
      "/library/books/b1/search?q=imagem%20docker",
    );
  });
});
