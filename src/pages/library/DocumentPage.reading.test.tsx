import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

const documentQuery = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const idle = { mutate: vi.fn(), isPending: false, isError: false };

vi.mock("./hooks/useLibrary", () => ({
  useDocument: () => documentQuery,
  useArchiveDocument: () => idle,
  useCategories: () => ({ data: [] }),
  useUpdateDocument: () => idle,
}));
vi.mock("./books/hooks", () => ({
  useBooks: () => ({ data: [], isLoading: false }),
  useAddBookChapter: () => idle,
  useCreateBook: () => idle,
}));

import { DocumentPage } from "./DocumentPage";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/library/id1"]}>
      <Routes>
        <Route path="/library/:id" element={<DocumentPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("DocumentPage — reading mode uses the shared reading section", () => {
  beforeEach(() => {
    documentQuery.data = {
      meta: {
        id: "id1",
        title: "Práticas da Primeira Maneira",
        type: "summary",
        source: "video",
        status: "published",
        category: ["DevOps"],
        tags: [],
        createdAt: "2026-03-05T10:00:00.000Z",
        updatedAt: "2026-03-06T10:00:00.000Z",
      },
      content: "# Introdução\n\ntexto",
    };
    documentQuery.isLoading = false;
    documentQuery.isError = false;
  });

  it("when reading, should show the page as a frameless section with the centered title", async () => {
    renderPage();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /Modo leitura/ }));

    const section = within(
      screen.getByRole("region", { name: "Modo leitura" }),
    ).getByRole("region", { name: "Práticas da Primeira Maneira" });

    expect(section.className).not.toMatch(/border|bg-card|shadow|rounded/);
    expect(
      within(section).getByRole("heading", {
        name: "Práticas da Primeira Maneira",
        level: 1,
      }).parentElement,
    ).toHaveClass("text-center");
  });

  it("when reading, should sit on the platform background", async () => {
    renderPage();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /Modo leitura/ }));

    expect(screen.getByRole("region", { name: "Modo leitura" })).toHaveClass(
      "bg-background",
    );
  });
});
