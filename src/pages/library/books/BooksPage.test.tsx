import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

const books = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};
const create = { mutate: vi.fn(), isPending: false, isError: false };
const update = { mutate: vi.fn(), isPending: false, isError: false };

vi.mock("./hooks", () => ({
  useBooks: () => books,
  useCreateBook: () => create,
  useUpdateBook: () => update,
}));

import { BooksPage } from "./BooksPage";

const book = (id: string, title: string, overrides = {}) => ({
  id,
  title,
  kind: "pos",
  description: "",
  subtitle: "",
  coverColor: "blue",
  coverImageUrl: "",
  chapterCount: 3,
  availableCount: 3,
  readCount: 0,
  completedAt: null,
  lastPosition: null,
  moduleCount: 2,
  updatedAt: "2026-03-05T10:00:00.000Z",
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/library/books"]}>
      <Routes>
        <Route path="/library/books" element={<BooksPage />} />
        <Route path="/library/books/:bookId" element={<p>livro aberto</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("BooksPage", () => {
  beforeEach(() => {
    books.data = [book("b1", "Pós em DevOps", { description: "Aulas" })];
    books.isLoading = false;
    books.isError = false;
    books.refetch.mockReset();
    create.mutate.mockReset();
    create.isPending = false;
    create.isError = false;
  });

  it("when loading, should show the loading state", () => {
    books.isLoading = true;
    books.data = undefined;
    renderPage();

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading fails, should show the error and retry on demand", async () => {
    books.isError = true;
    books.data = undefined;
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Tentar novamente/ }));

    expect(screen.getByText(/não foi possível carregar/)).toBeInTheDocument();
    expect(books.refetch).toHaveBeenCalled();
  });

  it("when there are books, should show title, kind, description and counts linking to the book", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "Pós em DevOps" })).toHaveAttribute(
      "href",
      "/library/books/b1",
    );
    expect(screen.getByText("Pós-graduação")).toBeInTheDocument();
    expect(screen.getByText("Aulas")).toBeInTheDocument();
    expect(
      screen.getByText(/3 capítulo\(s\) · 2 módulo\(s\)/),
    ).toBeInTheDocument();
  });

  it("when there are books, should show each one as a cover with its subtitle and color", () => {
    books.data = [book("b1", "Pós", { subtitle: "Aulas", coverColor: "rose" })];
    renderPage();

    const cover = screen.getByRole("img", { name: "Capa do livro Pós" });

    expect(cover).toHaveTextContent("Aulas");
    expect(cover).toHaveClass("from-rose-600");
  });

  it("when there are no books, should show the empty state with a way to create one", () => {
    books.data = [];
    renderPage();

    expect(screen.getByText("Nenhum livro ainda")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Criar o primeiro livro/ }),
    ).toBeInTheDocument();
  });

  it("when Novo livro is clicked, should open the form dialog", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Novo livro/ }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
  });

  it("when a book is created, should open it", async () => {
    create.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
        options.onSuccess({ id: "b9" }),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Novo livro/ }));

    await user.type(screen.getByLabelText("Título"), "Meu livro");
    await user.click(screen.getByRole("button", { name: "Criar livro" }));

    expect(screen.getByText("livro aberto")).toBeInTheDocument();
  });
});
