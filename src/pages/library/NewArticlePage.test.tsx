import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
        <Route path="/library" element={<p>lista de páginas</p>} />
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

const save = () => screen.getByRole("button", { name: /Salvar página/ });

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
  ])(
    "when only the %s is missing, should keep save disabled",
    async (_name, missing) => {
      const user = userEvent.setup();
      renderPage();
      await fill(user);
      await user.clear(screen.getByLabelText(missing));

      expect(save()).toBeDisabled();
    },
  );

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

  it("when submitted, should create the page with trimmed title, category, tags and content", async () => {
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

  it("when the page is created, should open it", async () => {
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

  it("when saving fails, should show an error message", () => {
    create.isError = true;
    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Não foi possível salvar a página/,
    );
  });

  it("when saving, should disable the form controls", () => {
    create.isPending = true;
    renderPage();

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(save()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
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

  describe("live preview", () => {
    it("when opened, should show the editor and the preview side by side without a toggle", () => {
      renderPage();

      expect(screen.getByLabelText("Conteúdo")).toBeInTheDocument();
      expect(screen.getByLabelText("Prévia da página")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Prévia" }),
      ).not.toBeInTheDocument();
    });

    it("when the preview is empty, should say there is nothing to show", () => {
      renderPage();

      expect(screen.getByText("Nada para mostrar ainda.")).toBeInTheDocument();
    });

    it("when typing, should render the markdown in the preview as it is typed", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(
        screen.getByLabelText("Conteúdo"),
        "# Título grande{Enter}{Enter}texto **forte**",
      );

      const preview = within(screen.getByLabelText("Prévia da página"));

      expect(
        preview.getByRole("heading", { name: "Título grande" }),
      ).toBeInTheDocument();
      expect(preview.getByText("forte")).toBeInTheDocument();
      expect(screen.getByLabelText("Conteúdo")).toHaveValue(
        "# Título grande\n\ntexto **forte**",
      );
    });
  });

  describe("layout", () => {
    it("when opened, should call the screen Nova página", () => {
      renderPage();

      expect(
        screen.getByRole("heading", { name: "Nova página", level: 1 }),
      ).toBeInTheDocument();
    });

    it("when opened, should split the screen into two separate sections", () => {
      renderPage();

      const sections = screen.getAllByRole("region", {
        name: /Dados da página|Texto da página/,
      });

      expect(sections.map((s) => s.getAttribute("aria-label"))).toEqual([
        "Dados da página",
        "Texto da página",
      ]);
      expect(sections[0]).toHaveTextContent("1. Dados da página");
      expect(sections[1]).toHaveTextContent("2. Texto da página");
    });

    it("when opened, should keep the fields and the library preview together in the first section", () => {
      renderPage();

      const data = within(
        screen.getByRole("region", { name: "Dados da página" }),
      );

      expect(data.getByLabelText("Título")).toBeInTheDocument();
      expect(data.getByLabelText("Categoria")).toBeInTheDocument();
      expect(data.getByLabelText("Adicionar tag")).toBeInTheDocument();
      expect(
        data.getByRole("region", { name: "Como vai ficar na biblioteca" }),
      ).toBeInTheDocument();
    });

    it("when opened, should keep the editor and its live preview only in the second section", () => {
      renderPage();

      const text = within(
        screen.getByRole("region", { name: "Texto da página" }),
      );
      const data = within(
        screen.getByRole("region", { name: "Dados da página" }),
      );

      expect(text.getByLabelText("Conteúdo")).toBeInTheDocument();
      expect(text.getByLabelText("Prévia da página")).toBeInTheDocument();
      expect(data.queryByLabelText("Conteúdo")).not.toBeInTheDocument();
      expect(data.queryByLabelText("Prévia da página")).not.toBeInTheDocument();
      expect(
        text.queryByRole("region", { name: "Como vai ficar na biblioteca" }),
      ).not.toBeInTheDocument();
    });

    it("when something is missing, should list what is missing next to save", () => {
      renderPage();

      expect(
        screen.getByText("Falta: título, categoria, texto."),
      ).toBeInTheDocument();
    });

    it("when the title is typed, should stop listing it as missing", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText("Título"), "X");

      expect(screen.getByText("Falta: categoria, texto.")).toBeInTheDocument();
    });

    it("when everything is filled, should say it is ready to save", async () => {
      const user = userEvent.setup();
      renderPage();

      await fill(user);

      expect(screen.getByText("Tudo pronto para salvar.")).toBeInTheDocument();
    });

    it("when Cancelar is clicked, should go back to the pages list", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.getByText("lista de páginas")).toBeInTheDocument();
    });

    it("when text is typed, should show the word count and the reading time", async () => {
      const user = userEvent.setup();
      renderPage();

      expect(
        screen.getByText(/0 palavra\(s\) · leitura estimada: —/),
      ).toBeInTheDocument();

      await user.type(screen.getByLabelText("Conteúdo"), "uma duas três");

      expect(
        screen.getByText(/3 palavra\(s\) · leitura estimada: 1 min/),
      ).toBeInTheDocument();
    });
  });
});
