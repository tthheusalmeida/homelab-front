import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const save = { mutate: vi.fn(), isPending: false, isError: false };
const documents = { data: [] as unknown[], isLoading: false };

vi.mock("../hooks", () => ({
  useSetBookStructure: () => save,
}));
vi.mock("../../hooks/useLibrary", () => ({
  useDocuments: () => documents,
}));

import type { BookDetail } from "../types";

import { BookOrganizerDialog } from "./BookOrganizerDialog";

const chapter = (documentId: string, title: string, available = true) => ({
  documentId,
  title,
  category: [],
  available,
});

const book = (): BookDetail => ({
  id: "b1",
  title: "Pós",
  kind: "pos",
  description: "",
  subtitle: "",
  coverColor: "blue",
  coverImageUrl: "",
  readDocumentIds: [],
  lastPosition: null,
  completedAt: null,
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-05T10:00:00.000Z",
  modules: [
    {
      id: "m1",
      title: "M1",
      chapters: [chapter("a", "Aula A"), chapter("b", "Aula B")],
    },
    { id: "m2", title: "M2", chapters: [chapter("c", "Aula C", false)] },
  ],
});

const doc = (id: string, title: string) => ({
  id,
  title,
  category: ["DevOps"],
});

const setup = () => {
  const onOpenChange = vi.fn();
  render(
    <BookOrganizerDialog open onOpenChange={onOpenChange} book={book()} />,
  );

  return { onOpenChange, user: userEvent.setup() };
};

const saveButton = () => screen.getByRole("button", { name: "Salvar" });
const structure = () =>
  within(screen.getByRole("region", { name: "Estrutura do livro" }));
const order = () =>
  structure()
    .getAllByRole("listitem")
    .map((li) => li.textContent);
const chapterItem = (title: string) =>
  screen.getByText(title).closest("li") as HTMLElement;
const moduleBox = (id: string) =>
  document.querySelector(`[data-module="${id}"]`) as HTMLElement;
const savedModules = () =>
  (
    save.mutate.mock.calls[0][0] as {
      modules: { id: string; title: string; documentIds: string[] }[];
    }
  ).modules;

/** Simula arrastar `source` e soltar em `target` (clientY<0 = metade de cima). */
function dragAndDrop(source: Element, target: Element, clientY: number) {
  const dataTransfer = {
    effectAllowed: "",
    setData: vi.fn(),
    setDragImage: vi.fn(),
  };

  fireEvent.dragStart(source, { dataTransfer });

  const over = createEvent.dragOver(target, { dataTransfer });
  Object.defineProperty(over, "clientY", { value: clientY });
  fireEvent(target, over);

  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(source, { dataTransfer });
}

describe("BookOrganizerDialog", () => {
  beforeEach(() => {
    save.mutate.mockReset();
    save.isPending = false;
    save.isError = false;
    documents.data = [
      doc("a", "Aula A"),
      doc("d", "Aula D"),
      doc("e", "Aula E"),
    ];
    documents.isLoading = false;
  });

  it("when open, should show the modules and chapters in order and Salvar disabled", () => {
    setup();

    expect(screen.getByLabelText("Título do módulo 1")).toHaveValue("M1");
    expect(screen.getByLabelText("Título do módulo 2")).toHaveValue("M2");
    expect(order()).toEqual([
      expect.stringContaining("Aula A"),
      expect.stringContaining("Aula B"),
      expect.stringContaining("Aula C"),
    ]);
    expect(saveButton()).toBeDisabled();
  });

  it("when a chapter is unavailable, should flag it", () => {
    setup();

    expect(screen.getByText("Indisponível")).toBeInTheDocument();
  });

  it("when open, should explain that items are dragged by the handle", () => {
    setup();

    expect(screen.getByText(/Arraste capítulos e módulos/)).toBeInTheDocument();
  });

  it("when open, should make chapters and module handles draggable", () => {
    setup();

    expect(chapterItem("Aula A")).toHaveAttribute("draggable", "true");
    expect(
      screen.getByRole("button", { name: "Arrastar módulo 1" }),
    ).toHaveAttribute("draggable", "true");
  });

  describe("drag and drop of chapters", () => {
    it("when dropped on the bottom half of a later chapter, should go after it", () => {
      setup();

      dragAndDrop(chapterItem("Aula A"), chapterItem("Aula B"), 1);

      expect(order()).toEqual([
        expect.stringContaining("Aula B"),
        expect.stringContaining("Aula A"),
        expect.stringContaining("Aula C"),
      ]);
      expect(saveButton()).toBeEnabled();
    });

    it("when dropped on the top half of a chapter of another module, should go before it", async () => {
      const { user } = setup();

      dragAndDrop(chapterItem("Aula A"), chapterItem("Aula C"), -1);
      await user.click(saveButton());

      expect(savedModules().map((m) => m.documentIds)).toEqual([
        ["b"],
        ["a", "c"],
      ]);
    });

    it("when dropped on the module area outside the chapters, should go to the end of that module", async () => {
      const { user } = setup();

      dragAndDrop(chapterItem("Aula A"), moduleBox("m2"), 1);
      await user.click(saveButton());

      expect(savedModules().map((m) => m.documentIds)).toEqual([
        ["b"],
        ["c", "a"],
      ]);
    });

    it("when a module becomes empty, should show the empty hint and accept drops", async () => {
      const { user } = setup();

      dragAndDrop(chapterItem("Aula C"), moduleBox("m1"), 1);

      expect(
        screen.getByText(/Nenhum capítulo neste módulo/),
      ).toBeInTheDocument();

      dragAndDrop(chapterItem("Aula A"), moduleBox("m2"), 1);
      await user.click(saveButton());

      expect(savedModules().map((m) => m.documentIds)).toEqual([
        ["b", "c"],
        ["a"],
      ]);
    });

    it("when dropped onto itself, should change nothing", () => {
      setup();

      dragAndDrop(chapterItem("Aula A"), chapterItem("Aula A"), -1);

      expect(saveButton()).toBeDisabled();
    });

    it("when something is dropped without dragging a chapter first, should change nothing", () => {
      setup();

      fireEvent.drop(chapterItem("Aula B"));

      expect(order()[0]).toContain("Aula A");
      expect(saveButton()).toBeDisabled();
    });
  });

  describe("drag and drop of modules", () => {
    it("when a module is dropped on the top half of another, should go before it keeping its chapters", async () => {
      const { user } = setup();

      dragAndDrop(
        screen.getByRole("button", { name: "Arrastar módulo 2" }),
        moduleBox("m1"),
        -1,
      );

      expect(screen.getByLabelText("Título do módulo 1")).toHaveValue("M2");

      await user.click(saveButton());

      expect(savedModules().map((m) => [m.id, m.documentIds])).toEqual([
        ["m2", ["c"]],
        ["m1", ["a", "b"]],
      ]);
    });

    it("when a module is dropped on the bottom half of the last one, should go to the end", () => {
      setup();

      dragAndDrop(
        screen.getByRole("button", { name: "Arrastar módulo 1" }),
        moduleBox("m2"),
        1,
      );

      expect(screen.getByLabelText("Título do módulo 1")).toHaveValue("M2");
      expect(screen.getByLabelText("Título do módulo 2")).toHaveValue("M1");
    });

    it("when a module is dropped over a chapter of another module, should reorder the modules and keep every chapter", () => {
      setup();

      dragAndDrop(
        screen.getByRole("button", { name: "Arrastar módulo 1" }),
        chapterItem("Aula C"),
        1,
      );

      expect(screen.getByLabelText("Título do módulo 1")).toHaveValue("M2");
      expect(screen.getByLabelText("Título do módulo 2")).toHaveValue("M1");
      expect(order()).toEqual([
        expect.stringContaining("Aula C"),
        expect.stringContaining("Aula A"),
        expect.stringContaining("Aula B"),
      ]);
    });
  });

  it("when a chapter is removed, should leave the list", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", { name: "Remover Aula B do livro" }),
    );

    expect(structure().queryByText("Aula B")).not.toBeInTheDocument();
  });

  it("when a module is renamed, should enable Salvar and send the new title", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText("Título do módulo 1"), " novo");
    await user.click(saveButton());

    expect(savedModules()[0].title).toBe("M1 novo");
  });

  describe("Novo módulo", () => {
    it("when open, should be the first control, above all modules", () => {
      setup();

      const region = screen.getByRole("region", { name: "Estrutura do livro" });
      const button = within(region).getByRole("button", {
        name: /Novo módulo/,
      });
      const firstModule = region.querySelector("[data-module]") as Element;

      expect(
        button.compareDocumentPosition(firstModule) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(region.firstElementChild).toBe(button);
    });

    it("when clicked, should add an empty module at the end of the list", async () => {
      const { user } = setup();

      await user.click(screen.getByRole("button", { name: /Novo módulo/ }));

      expect(screen.getByLabelText("Título do módulo 3")).toHaveValue(
        "Novo módulo",
      );
      expect(
        screen.getByText(/Nenhum capítulo neste módulo/),
      ).toBeInTheDocument();

      await user.click(saveButton());

      expect(savedModules().map((m) => m.title)).toEqual([
        "M1",
        "M2",
        "Novo módulo",
      ]);
    });
  });

  it("when a module is removed, should move its chapters to the previous one", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Remover módulo 2" }));
    await user.click(saveButton());

    expect(savedModules()).toEqual([
      { id: "m1", title: "M1", documentIds: ["a", "b", "c"] },
    ]);
  });

  it("when there is only one module, should not allow removing it", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Remover módulo 2" }));

    expect(
      screen.getByRole("button", { name: "Remover módulo 1" }),
    ).toBeDisabled();
  });

  it("when listing documents to add, should hide the ones already in the book", () => {
    setup();

    expect(
      screen.queryByRole("button", { name: "Adicionar Aula A" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Adicionar Aula D" }),
    ).toBeInTheDocument();
  });

  it("when a document is added, should append it to the last module and hide it from the picker", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Adicionar Aula D" }));

    expect(structure().getByText("Aula D")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Adicionar Aula D" }),
    ).not.toBeInTheDocument();

    await user.click(saveButton());

    expect(savedModules()[1].documentIds).toEqual(["c", "d"]);
  });

  it("when no document is left to add, should say so", () => {
    documents.data = [];
    setup();

    expect(
      screen.getByText("Nenhuma página disponível para adicionar."),
    ).toBeInTheDocument();
  });

  it("when saving succeeds, should close the dialog", async () => {
    save.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const { user, onOpenChange } = setup();

    dragAndDrop(chapterItem("Aula A"), chapterItem("Aula B"), 1);
    await user.click(saveButton());

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(save.mutate).toHaveBeenCalledWith(
      { id: "b1", modules: expect.any(Array) },
      expect.any(Object),
    );
  });

  it("when saving fails, should show an error", () => {
    save.isError = true;
    setup();

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Não foi possível salvar o livro/,
    );
  });

  it("when Cancelar is clicked, should close without saving", async () => {
    const { user, onOpenChange } = setup();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(save.mutate).not.toHaveBeenCalled();
  });
});
