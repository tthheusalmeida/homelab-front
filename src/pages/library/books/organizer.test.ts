import { describe, expect, it } from "vitest";

import {
  addChapters,
  addModule,
  dropChapter,
  dropModule,
  dropSide,
  removeChapter,
  removeModule,
  renameModule,
  sameStructure,
  toDrafts,
} from "./organizer";
import type { BookDetail, ModuleDraft } from "./types";

const base = (): ModuleDraft[] => [
  { id: "m1", title: "M1", documentIds: ["a", "b"] },
  { id: "m2", title: "M2", documentIds: ["c"] },
];

const ids = (modules: ModuleDraft[]) => modules.map((m) => m.documentIds);

describe("toDrafts", () => {
  it("when the book has modules, should keep ids, titles and chapter order", () => {
    const book = {
      modules: [
        {
          id: "m1",
          title: "M1",
          chapters: [
            { documentId: "a", title: "A", category: [], available: true },
            { documentId: "b", title: "B", category: [], available: false },
          ],
        },
      ],
    } as unknown as BookDetail;

    expect(toDrafts(book)).toEqual([
      { id: "m1", title: "M1", documentIds: ["a", "b"] },
    ]);
  });
});

describe("dropChapter", () => {
  it("when dropped after a later chapter in the same module, should move it down", () => {
    expect(ids(dropChapter(base(), "a", "m1", 2))).toEqual([["b", "a"], ["c"]]);
  });

  it("when dropped before an earlier chapter in the same module, should move it up", () => {
    expect(ids(dropChapter(base(), "b", "m1", 0))).toEqual([["b", "a"], ["c"]]);
  });

  it("when dropped right where it already is, should change nothing", () => {
    const modules = base();

    expect(dropChapter(modules, "a", "m1", 0)).toBe(modules);
    expect(dropChapter(modules, "a", "m1", 1)).toBe(modules);
  });

  it("when dropped in another module at a position, should move it there", () => {
    expect(ids(dropChapter(base(), "a", "m2", 0))).toEqual([["b"], ["a", "c"]]);
    expect(ids(dropChapter(base(), "a", "m2", 1))).toEqual([["b"], ["c", "a"]]);
  });

  it("when dropped in an empty module, should fill it", () => {
    const modules = [...base(), { id: "m3", title: "M3", documentIds: [] }];

    expect(ids(dropChapter(modules, "a", "m3", 0))).toEqual([
      ["b"],
      ["c"],
      ["a"],
    ]);
  });

  it("when the index is out of range, should clamp it to the ends", () => {
    expect(ids(dropChapter(base(), "c", "m1", 99))).toEqual([
      ["a", "b", "c"],
      [],
    ]);
    expect(ids(dropChapter(base(), "c", "m1", -5))).toEqual([
      ["c", "a", "b"],
      [],
    ]);
  });

  it("when the document or module does not exist, should change nothing", () => {
    const modules = base();

    expect(dropChapter(modules, "x", "m1", 0)).toBe(modules);
    expect(dropChapter(modules, "a", "zzz", 0)).toBe(modules);
  });

  it("when dropping, should not mutate the original", () => {
    const modules = base();

    dropChapter(modules, "a", "m2", 0);

    expect(ids(modules)).toEqual([["a", "b"], ["c"]]);
  });
});

describe("dropModule", () => {
  it("when dropped after a later module, should move it down", () => {
    expect(dropModule(base(), "m1", 2).map((m) => m.id)).toEqual(["m2", "m1"]);
  });

  it("when dropped before an earlier module, should move it up", () => {
    expect(dropModule(base(), "m2", 0).map((m) => m.id)).toEqual(["m2", "m1"]);
  });

  it("when dropped where it already is, should change nothing", () => {
    const modules = base();

    expect(dropModule(modules, "m1", 0)).toBe(modules);
    expect(dropModule(modules, "m1", 1)).toBe(modules);
  });

  it("when the module does not exist, should change nothing", () => {
    const modules = base();

    expect(dropModule(modules, "zzz", 0)).toBe(modules);
  });

  it("when moving a module, should keep its chapters", () => {
    expect(ids(dropModule(base(), "m2", 0))).toEqual([["c"], ["a", "b"]]);
  });
});

describe("dropSide", () => {
  const rect = { top: 100, height: 40 };

  it("when the pointer is on the top half, should be before", () => {
    expect(dropSide(110, rect)).toBe("before");
  });

  it("when the pointer is on the bottom half, should be after", () => {
    expect(dropSide(130, rect)).toBe("after");
    expect(dropSide(120, rect)).toBe("after");
  });
});

describe("removeChapter", () => {
  it("when removing, should drop it from its module only", () => {
    expect(ids(removeChapter(base(), "b"))).toEqual([["a"], ["c"]]);
  });
});

describe("addChapters", () => {
  it("when adding, should append to the last module and skip the ones already present", () => {
    expect(ids(addChapters(base(), ["a", "d", "e"]))).toEqual([
      ["a", "b"],
      ["c", "d", "e"],
    ]);
  });

  it("when nothing is new, should return the same structure", () => {
    const modules = base();

    expect(addChapters(modules, ["a"])).toBe(modules);
  });

  it("when there are no modules, should change nothing", () => {
    expect(addChapters([], ["a"])).toEqual([]);
  });
});

describe("modules", () => {
  it("when adding a module, should append an empty one at the end with the default title", () => {
    const next = addModule(base(), "m3");

    expect(next.map((m) => m.id)).toEqual(["m1", "m2", "m3"]);
    expect(next[2]).toEqual({
      id: "m3",
      title: "Novo módulo",
      documentIds: [],
    });
  });

  it("when renaming, should change only that module", () => {
    const next = renameModule(base(), "m2", "Novo");

    expect(next.map((m) => m.title)).toEqual(["M1", "Novo"]);
  });

  it("when removing a module, should send its chapters to the previous one", () => {
    expect(ids(removeModule(base(), "m2"))).toEqual([["a", "b", "c"]]);
  });

  it("when removing the first module, should send its chapters to the start of the next", () => {
    const next = removeModule(base(), "m1");

    expect(next).toHaveLength(1);
    expect(next[0].documentIds).toEqual(["a", "b", "c"]);
  });

  it("when there is only one module, should not remove it", () => {
    const only = [base()[0]];

    expect(removeModule(only, "m1")).toBe(only);
  });
});

describe("sameStructure", () => {
  it("when structures are equal, should be true; after a change, false", () => {
    expect(sameStructure(base(), base())).toBe(true);
    expect(sameStructure(base(), dropChapter(base(), "a", "m2", 0))).toBe(
      false,
    );
  });
});
