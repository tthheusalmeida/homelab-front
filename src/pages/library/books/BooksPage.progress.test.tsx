import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const books = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

vi.mock("./hooks", () => ({
  useBooks: () => books,
  useCreateBook: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useUpdateBook: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}));

import { BooksPage } from "./BooksPage";

const book = (overrides = {}) => ({
  id: "b1",
  title: "Pós",
  kind: "pos",
  description: "",
  subtitle: "",
  coverColor: "blue",
  coverImageUrl: "",
  chapterCount: 10,
  availableCount: 10,
  readCount: 0,
  completedAt: null,
  lastPosition: null,
  moduleCount: 1,
  updatedAt: "2026-03-05T10:00:00.000Z",
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <BooksPage />
    </MemoryRouter>,
  );

describe("BooksPage — progress", () => {
  beforeEach(() => {
    books.data = [book()];
    books.isLoading = false;
    books.isError = false;
  });

  it("when a book has progress, should show the bar with chapters read", () => {
    books.data = [book({ readCount: 4 })];
    renderPage();

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "4",
    );
    expect(
      screen.getByText("4 de 10 capítulo(s) lidos · 40%"),
    ).toBeInTheDocument();
  });

  it("when the book has a last position, should offer to continue where it stopped", () => {
    books.data = [
      book({
        readCount: 4,
        lastPosition: { documentId: "d1", elementId: "x" },
      }),
    ];
    renderPage();

    expect(
      screen.getByRole("link", { name: /Continuar de onde parou/ }),
    ).toHaveAttribute("href", "/library/books/b1?continuar=1");
  });

  it("when the book has never been read, should not offer to continue", () => {
    renderPage();

    expect(
      screen.queryByRole("link", { name: /Continuar de onde parou/ }),
    ).not.toBeInTheDocument();
  });

  it("when the book is completed, should show the golden cover and no continue link", () => {
    books.data = [
      book({
        readCount: 10,
        completedAt: "2026-11-14T10:00:00.000Z",
        lastPosition: { documentId: "d1", elementId: "x" },
      }),
    ];
    renderPage();

    const cover = screen.getByRole("img", { name: "Capa do livro Pós" });

    expect(cover).toHaveClass("ring-amber-400");
    expect(cover).toHaveTextContent("Concluído");
    expect(screen.getByText("Concluído em 14/11/2026")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Continuar de onde parou/ }),
    ).not.toBeInTheDocument();
  });

  it("when the book has nothing to read, should not show the progress bar", () => {
    books.data = [book({ availableCount: 0, chapterCount: 0 })];
    renderPage();

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
