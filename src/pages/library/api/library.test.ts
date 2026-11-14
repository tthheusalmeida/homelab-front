import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#lib/api", () => ({ api: vi.fn().mockResolvedValue({}) }));

import { api } from "#lib/api";

import {
  archiveDocument,
  buildDocumentsQuery,
  createArticle,
  discardDocument,
  getCategories,
  getDocument,
  getDocuments,
  getIndexStatus,
  getInbox,
  getTags,
  publishDocument,
  reindex,
  suggestClassification,
} from "./library";

describe("buildDocumentsQuery", () => {
  it("when there are no filters, should return an empty string", () => {
    expect(buildDocumentsQuery()).toBe("");
    expect(buildDocumentsQuery({})).toBe("");
  });

  it("when text has spaces around, should send it trimmed; blank text is omitted", () => {
    expect(buildDocumentsQuery({ q: "  devops  " })).toBe("q=devops");
    expect(buildDocumentsQuery({ q: "   " })).toBe("");
  });

  it("when category and tags have several values, should repeat the parameter in order", () => {
    const query = buildDocumentsQuery({
      category: ["Ciência da Computação", "DevOps"],
      tags: ["a", "b"],
    });
    const params = new URLSearchParams(query);

    expect(params.getAll("category")).toEqual(["Ciência da Computação", "DevOps"]);
    expect(params.getAll("tag")).toEqual(["a", "b"]);
  });

  it("when type, source, status and sort are given, should send each one", () => {
    const params = new URLSearchParams(
      buildDocumentsQuery({
        type: "transcription",
        source: "video",
        status: "archived",
        sort: "recent",
      }),
    );

    expect(Object.fromEntries(params)).toEqual({
      type: "transcription",
      source: "video",
      status: "archived",
      sort: "recent",
    });
  });
});

describe("library api", () => {
  beforeEach(() => {
    vi.mocked(api).mockClear();
  });

  it("when listing documents without filters, should call /library/documents", async () => {
    await getDocuments();

    expect(api).toHaveBeenCalledWith("/library/documents");
  });

  it("when listing documents with filters, should append the query string", async () => {
    await getDocuments({ type: "transcription", category: ["A"] });

    expect(api).toHaveBeenCalledWith(
      "/library/documents?category=A&type=transcription",
    );
  });

  it("when reading simple resources, should call their endpoints", async () => {
    await getInbox();
    await getCategories();
    await getTags();
    await getIndexStatus();

    expect(vi.mocked(api).mock.calls.map((call) => call[0])).toEqual([
      "/library/inbox",
      "/library/categories",
      "/library/tags",
      "/library/index",
    ]);
  });

  it("when getting a document, should encode the id", async () => {
    await getDocument("a/b c");

    expect(api).toHaveBeenCalledWith("/library/documents/a%2Fb%20c");
  });

  it("when reindexing, should POST /library/reindex", async () => {
    await reindex();

    expect(api).toHaveBeenCalledWith("/library/reindex", { method: "POST" });
  });

  it("when publishing, should POST the input as json", async () => {
    const input = { title: "T", category: ["A"], tags: ["x"] };

    await publishDocument("id1", input);

    expect(api).toHaveBeenCalledWith("/library/documents/id1/publish", {
      method: "POST",
      body: JSON.stringify(input),
    });
  });

  it("when archiving, should POST to the archive endpoint", async () => {
    await archiveDocument("id1");

    expect(api).toHaveBeenCalledWith("/library/documents/id1/archive", {
      method: "POST",
    });
  });

  it("when discarding, should send DELETE", async () => {
    await discardDocument("id1");

    expect(api).toHaveBeenCalledWith("/library/documents/id1", {
      method: "DELETE",
    });
  });

  it("when suggesting with a model, should POST the model id", async () => {
    await suggestClassification("id1", "gemini-3.5-flash");

    expect(api).toHaveBeenCalledWith("/library/documents/id1/suggest", {
      method: "POST",
      body: JSON.stringify({ modelId: "gemini-3.5-flash" }),
    });
  });

  it("when suggesting without a model, should POST an empty body", async () => {
    await suggestClassification("a/b");

    expect(api).toHaveBeenCalledWith("/library/documents/a%2Fb/suggest", {
      method: "POST",
      body: "{}",
    });
  });

  it("when creating an article, should POST it as json", async () => {
    const input = { title: "T", category: ["A"], content: "c" };

    await createArticle(input);

    expect(api).toHaveBeenCalledWith("/library/documents/article", {
      method: "POST",
      body: JSON.stringify(input),
    });
  });
});
