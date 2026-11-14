import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

const create = { mutate: vi.fn(), isPending: false, isError: false };
const categories = { data: [] as unknown[] };

vi.mock("./hooks/useLibrary", () => ({
  useCategories: () => categories,
  useCreateArticle: () => create,
}));

import { NewArticlePage } from "./NewArticlePage";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/library/new"]}>
      <Routes>
        <Route path="/library/new" element={<NewArticlePage />} />
        <Route path="/library/:id" element={<p>aberto</p>} />
      </Routes>
    </MemoryRouter>,
  );

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Título"), "  Ligações Peptídicas ");
  await user.type(screen.getByLabelText("Categoria"), "Química");
  await user.type(screen.getByLabelText("Subcategoria"), "Ligações");
  await user.type(screen.getByLabelText("Adicionar tag"), "bioquímica{Enter}");
  await user.type(screen.getByLabelText("Conteúdo"), "# Olá");
}

const save = () => screen.getByRole("button", { name: /Salvar artigo/ });

describe("NewArticlePage", () => {
  beforeEach(() => {
    create.mutate.mockReset();
    create.isPending = false;
    create.isError = false;
    categories.data = [];
  });

  it("when empty, should keep save disabled", () => {
    renderPage();

    expect(save()).toBeDisabled();
  });

  it.each([
    ["título", "Título"],
    ["categoria", "Categoria"],
    ["conteúdo", "Conteúdo"],
  ])("when only the %s is missing, should keep save disabled", async (_name, missing) => {
    const user = userEvent.setup();
    renderPage();
    await fill(user);
    await user.clear(screen.getByLabelText(missing));

    expect(save()).toBeDisabled();
  });

  it("when title, category and content are filled, should enable save", async () => {
    const user = userEvent.setup();
    renderPage();

    await fill(user);

    expect(save()).toBeEnabled();
  });

  it("when the content is only whitespace, should keep save disabled", async () => {
    const user = userEvent.setup();
    renderPage();
    await fill(user);
    await user.clear(screen.getByLabelText("Conteúdo"));
    await user.type(screen.getByLabelText("Conteúdo"), "   ");

    expect(save()).toBeDisabled();
  });

  it("when submitted, should create the article with trimmed title, category, tags and content", async () => {
    const user = userEvent.setup();
    renderPage();
    await fill(user);

    await user.click(save());

    expect(create.mutate).toHaveBeenCalledWith(
      {
        title: "Ligações Peptídicas",
        category: ["Química", "Ligações"],
        tags: ["bioquímica"],
        content: "# Olá",
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("when the article is created, should open it", async () => {
    create.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: (r: unknown) => void }) =>
        options.onSuccess({ meta: { id: "novo-id" } }),
    );
    const user = userEvent.setup();
    renderPage();
    await fill(user);

    await user.click(save());

    expect(screen.getByText("aberto")).toBeInTheDocument();
  });

  it("when Prévia is clicked, should render the markdown instead of the editor", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Conteúdo"), "# Título grande");

    await user.click(screen.getByRole("button", { name: /Prévia/ }));

    expect(screen.getByRole("heading", { name: "Título grande" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Conteúdo")).not.toBeInTheDocument();
  });

  it("when the preview is empty, should say there is nothing to show", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Prévia/ }));

    expect(screen.getByText("Nada para mostrar ainda.")).toBeInTheDocument();
  });

  it("when going back from the preview to Editar, should keep the typed content", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Conteúdo"), "meu texto");

    await user.click(screen.getByRole("button", { name: /Prévia/ }));
    await user.click(screen.getByRole("button", { name: /Editar/ }));

    expect(screen.getByLabelText("Conteúdo")).toHaveValue("meu texto");
  });

  it("when saving fails, should show an error message", () => {
    create.isError = true;
    renderPage();

    expect(screen.getByText(/Não foi possível salvar o artigo/)).toBeInTheDocument();
  });

  it("when saving, should disable the form controls", () => {
    create.isPending = true;
    renderPage();

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(save()).toBeDisabled();
  });

  it("when categories already exist, should suggest them at the first level", () => {
    categories.data = [{ name: "Química", children: [] }];
    renderPage();

    const list = screen.getByLabelText("Categoria").getAttribute("list")!;
    expect(
      Array.from(document.querySelectorAll(`#${list} option`)).map((o) =>
        o.getAttribute("value"),
      ),
    ).toEqual(["Química"]);
  });
});
