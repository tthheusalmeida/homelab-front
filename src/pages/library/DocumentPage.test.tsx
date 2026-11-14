import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

const documentQuery = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const archive = { mutate: vi.fn(), isPending: false, isError: false };
const useDocumentSpy = vi.fn();

vi.mock("./hooks/useLibrary", () => ({
  useDocument: (id: string) => {
    useDocumentSpy(id);
    return documentQuery;
  },
  useArchiveDocument: () => archive,
}));

import { DocumentPage } from "./DocumentPage";

const detail = (status = "published") => ({
  meta: {
    id: "id1",
    title: "Práticas da Primeira Maneira",
    type: "summary",
    source: "video",
    sourceUrl: "https://exemplo.com/v.mp4",
    status,
    category: ["Ciência", "DevOps"],
    tags: ["devops"],
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-06T10:00:00.000Z",
  },
  content: "# Introdução\n\nVeja [o site](https://x.com).",
});

const renderPage = (entries = ["/library/id1"], index?: number) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <Routes>
        <Route path="/library" element={<p>página da biblioteca</p>} />
        <Route path="/library/:id" element={<DocumentPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("DocumentPage", () => {
  beforeEach(() => {
    documentQuery.data = detail();
    documentQuery.isLoading = false;
    documentQuery.isError = false;
    archive.mutate.mockReset();
    archive.isPending = false;
    archive.isError = false;
    useDocumentSpy.mockClear();
  });

  it("when opened, should load the document of the route id", () => {
    renderPage();

    expect(useDocumentSpy).toHaveBeenCalledWith("id1");
  });

  it("when loading, should show the loading state", () => {
    documentQuery.isLoading = true;
    documentQuery.data = undefined;
    renderPage();

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when the document fails to load, should show the error and a way back", async () => {
    documentQuery.isError = true;
    documentQuery.data = undefined;
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText(/não foi possível abrir o documento/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Voltar à biblioteca/ }));

    expect(screen.getByText("página da biblioteca")).toBeInTheDocument();
  });

  it("when loaded, should show title, category, type, status, tags and dates", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Práticas da Primeira Maneira" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Categoria" })).toHaveTextContent(
      "CiênciaDevOps",
    );
    expect(screen.getByText("Resumo")).toBeInTheDocument();
    expect(screen.getByText("Na biblioteca")).toBeInTheDocument();
    expect(screen.getByText("devops")).toBeInTheDocument();
    expect(screen.getByText(/Criado em/)).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
  });

  it("when loaded, should render the content as markdown", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Introdução" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "o site" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("when the document has a source url, should link to it in a new tab", () => {
    renderPage();

    const link = screen.getByRole("link", { name: /Fonte original/ });
    expect(link).toHaveAttribute("href", "https://exemplo.com/v.mp4");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("when the document has no source url, should not show the source link", () => {
    const value = detail();
    delete (value.meta as { sourceUrl?: string }).sourceUrl;
    documentQuery.data = value;
    renderPage();

    expect(screen.queryByRole("link", { name: /Fonte original/ })).not.toBeInTheDocument();
  });

  it("when Voltar is clicked, should go back to the previous page", async () => {
    const user = userEvent.setup();
    renderPage(["/library", "/library/id1"], 1);

    await user.click(screen.getByRole("button", { name: /Voltar$/ }));

    expect(screen.getByText("página da biblioteca")).toBeInTheDocument();
  });

  it("when the document is published, should offer to remove it from the library", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    ).toBeInTheDocument();
  });

  it.each(["pending", "archived"])(
    "when the document is %s, should not offer the removal",
    (status) => {
      documentQuery.data = detail(status);
      renderPage();

      expect(
        screen.queryByRole("button", { name: /Remover da biblioteca/ }),
      ).not.toBeInTheDocument();
    },
  );

  it("when removal is requested, should ask for confirmation before archiving", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Remover da biblioteca/ }));

    expect(screen.getByText("Remover da biblioteca?")).toBeInTheDocument();
    expect(archive.mutate).not.toHaveBeenCalled();
  });

  it("when the confirmation is cancelled, should not archive", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Remover da biblioteca/ }));

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(archive.mutate).not.toHaveBeenCalled();
  });

  it("when removal is confirmed, should archive the document and return to the library", async () => {
    archive.mutate.mockImplementation(
      (_id: string, options: { onSuccess: () => void }) => options.onSuccess(),
    );
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Remover da biblioteca/ }));

    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(archive.mutate).toHaveBeenCalledWith("id1", expect.any(Object));
    expect(screen.getByText("página da biblioteca")).toBeInTheDocument();
  });

  it("when removal fails, should show an error message", () => {
    archive.isError = true;
    renderPage();

    expect(screen.getByText(/Não foi possível remover/)).toBeInTheDocument();
  });
});
