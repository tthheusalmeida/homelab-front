import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const books = { data: [] as unknown[], isLoading: false };
const add = { mutate: vi.fn(), isPending: false, isError: false };
const create = { mutate: vi.fn(), isPending: false, isError: false };
const useBooksSpy = vi.fn();

vi.mock("../hooks", () => ({
  useBooks: (documentId?: string) => {
    useBooksSpy(documentId);
    return books;
  },
  useAddBookChapter: () => add,
  useCreateBook: () => create,
}));

import { AddToBookDialog } from "./AddToBookDialog";

const summary = (id: string, title: string, containsDocument = false) => ({
  id,
  title,
  kind: "pos",
  description: "",
  chapterCount: 1,
  moduleCount: 1,
  updatedAt: "2026-03-05T10:00:00.000Z",
  containsDocument,
});

const setup = () => {
  const onOpenChange = vi.fn();
  render(<AddToBookDialog open onOpenChange={onOpenChange} documentId="d1" />);

  return { onOpenChange, user: userEvent.setup() };
};

describe("AddToBookDialog", () => {
  beforeEach(() => {
    books.data = [summary("b1", "Pós"), summary("b2", "Curso", true)];
    books.isLoading = false;
    add.mutate.mockReset();
    add.isError = false;
    add.isPending = false;
    create.mutate.mockReset();
    create.isError = false;
    useBooksSpy.mockClear();
  });

  it("when open, should list the books asking which already have the document", () => {
    setup();

    expect(useBooksSpy).toHaveBeenCalledWith("d1");
    expect(screen.getByText("Pós")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Adicionar ao livro Pós" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Curso: já está no livro" }),
    ).toBeDisabled();
  });

  it("when a book is chosen, should add the document and close", async () => {
    add.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const { user, onOpenChange } = setup();

    await user.click(
      screen.getByRole("button", { name: "Adicionar ao livro Pós" }),
    );

    expect(add.mutate).toHaveBeenCalledWith(
      { id: "b1", documentId: "d1" },
      expect.any(Object),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when there are no books, should invite creating one", () => {
    books.data = [];
    setup();

    expect(screen.getByText(/ainda não tem livros/)).toBeInTheDocument();
  });

  it("when the new book name is empty, should keep Criar e adicionar disabled", () => {
    setup();

    expect(
      screen.getByRole("button", { name: "Criar e adicionar" }),
    ).toBeDisabled();
  });

  it("when a new book is created, should add the document to it and close", async () => {
    create.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
        options.onSuccess({ id: "b9" }),
    );
    add.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const { user, onOpenChange } = setup();

    await user.type(screen.getByLabelText("Nome do novo livro"), " Novo ");
    await user.click(screen.getByRole("button", { name: "Criar e adicionar" }));

    expect(create.mutate).toHaveBeenCalledWith(
      { title: "Novo" },
      expect.any(Object),
    );
    expect(add.mutate).toHaveBeenCalledWith(
      { id: "b9", documentId: "d1" },
      expect.any(Object),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when adding fails, should show an error", () => {
    add.isError = true;
    setup();

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Não foi possível adicionar ao livro/,
    );
  });

  it("when closed, should render nothing", () => {
    render(
      <AddToBookDialog open={false} onOpenChange={() => {}} documentId="d1" />,
    );

    expect(screen.queryByText("Adicionar a um livro")).not.toBeInTheDocument();
  });
});
