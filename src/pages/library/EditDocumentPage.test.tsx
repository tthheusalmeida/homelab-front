import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

const documentQuery = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const update = { mutate: vi.fn(), isPending: false, isError: false };
const categories = { data: [] as unknown[] };

vi.mock("./hooks/useLibrary", () => ({
  useDocument: () => documentQuery,
  useCategories: () => categories,
  useUpdateDocument: () => update,
}));

import { EditDocumentPage } from "./EditDocumentPage";

const detail = (status = "published") => ({
  meta: {
    id: "id1",
    title: "Práticas",
    type: "summary",
    source: "video",
    status,
    category: ["Ciência", "DevOps"],
    tags: ["devops"],
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-06T10:00:00.000Z",
  },
  content: "# Introdução",
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/library/id1/edit"]}>
      <Routes>
        <Route path="/library" element={<p>página da biblioteca</p>} />
        <Route path="/library/:id" element={<p>documento aberto</p>} />
        <Route path="/library/:id/edit" element={<EditDocumentPage />} />
      </Routes>
    </MemoryRouter>,
  );

const save = () => screen.getByRole("button", { name: /Salvar alterações/ });

describe("EditDocumentPage", () => {
  beforeEach(() => {
    update.mutate.mockReset();
    update.isPending = false;
    update.isError = false;
    documentQuery.data = detail();
    documentQuery.isLoading = false;
    documentQuery.isError = false;
    categories.data = [];
  });

  it("when loading, should show the loading state", () => {
    documentQuery.isLoading = true;
    documentQuery.data = undefined;
    renderPage();

    expect(screen.getByText(/Carregando/)).toBeInTheDocument();
  });

  it("when the document fails to load, should offer going back to the library", async () => {
    documentQuery.isError = true;
    documentQuery.data = undefined;
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: "Voltar à biblioteca" }),
    );

    expect(screen.getByText("página da biblioteca")).toBeInTheDocument();
  });

  it.each(["pending", "archived"])(
    "when the document is %s, should explain it cannot be edited and not show the form",
    (status) => {
      documentQuery.data = detail(status);
      renderPage();

      expect(
        screen.getByText(
          /Só é possível editar páginas que estão na biblioteca/,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Título")).not.toBeInTheDocument();
    },
  );

  it("when a published document loads, should fill title, category, tags and content", () => {
    renderPage();

    expect(screen.getByLabelText("Título")).toHaveValue("Práticas");
    expect(screen.getByLabelText("Categoria")).toHaveValue("Ciência");
    expect(screen.getByLabelText("Subcategoria")).toHaveValue("DevOps");
    expect(screen.getByLabelText("Conteúdo")).toHaveValue("# Introdução");
    expect(screen.getAllByText("devops").length).toBeGreaterThan(0);
  });

  it("when nothing changed, should keep save disabled", () => {
    renderPage();

    expect(save()).toBeDisabled();
  });

  it("when the content changes, should enable save", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Conteúdo"), " mais");

    expect(save()).toBeEnabled();
  });

  it.each([
    ["título", "Título"],
    ["categoria", "Categoria"],
    ["conteúdo", "Conteúdo"],
  ])("when the %s is cleared, should disable save", async (_name, field) => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(screen.getByLabelText(field));

    expect(save()).toBeDisabled();
  });

  it("when the only change is a tag, should enable save", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Adicionar tag"), "nova{Enter}");

    expect(save()).toBeEnabled();
  });

  it("when saved, should send id, trimmed title, category, tags and content", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "  Novo título ");
    await user.type(screen.getByLabelText("Adicionar tag"), "nova{Enter}");
    await user.click(save());

    expect(update.mutate).toHaveBeenCalledWith(
      {
        id: "id1",
        input: {
          title: "Novo título",
          category: ["Ciência", "DevOps"],
          tags: ["devops", "nova"],
          content: "# Introdução",
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("when the save succeeds, should go back to the document", async () => {
    update.mutate.mockImplementation(
      (_variables: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Conteúdo"), "x");

    await user.click(save());

    expect(screen.getByText("documento aberto")).toBeInTheDocument();
  });

  it("when the save fails, should show an error message and keep the form", () => {
    update.isError = true;
    renderPage();

    expect(
      screen.getByText(/Não foi possível salvar as alterações/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
  });

  it("when pending, should disable the fields and the buttons", () => {
    update.isPending = true;
    renderPage();

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(save()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("when Cancelar is clicked, should go back without saving", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByText("documento aberto")).toBeInTheDocument();
    expect(update.mutate).not.toHaveBeenCalled();
  });

  it("when editing, should show the preview of how it will look in the library", () => {
    renderPage();

    expect(
      screen.getByRole("region", { name: "Como vai ficar na biblioteca" }),
    ).toBeInTheDocument();
  });
});
