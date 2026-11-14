import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

const documentQuery = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const archive = { mutate: vi.fn(), isPending: false, isError: false };
const update = { mutate: vi.fn(), isPending: false, isError: false };
const useDocumentSpy = vi.fn();

vi.mock("./hooks/useLibrary", () => ({
  useDocument: (id: string) => {
    useDocumentSpy(id);
    return documentQuery;
  },
  useArchiveDocument: () => archive,
  useCategories: () => ({ data: [] }),
  useUpdateDocument: () => update,
}));

vi.mock("./books/hooks", () => ({
  useBooks: () => ({ data: [], isLoading: false }),
  useAddBookChapter: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useCreateBook: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
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

function LibraryProbe() {
  const { state } = useLocation();

  return <p>biblioteca {JSON.stringify(state)}</p>;
}

const renderPage = (entries = ["/library/id1"], index?: number) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <Routes>
        <Route path="/library" element={<LibraryProbe />} />
        <Route path="/library/:id" element={<DocumentPage />} />
      </Routes>
    </MemoryRouter>,
  );

const aboutButton = () =>
  screen.getByRole("button", { name: /Sobre a página/ });

async function openAbout() {
  const user = userEvent.setup();
  renderPage();
  await user.click(aboutButton());

  return user;
}

describe("DocumentPage", () => {
  beforeEach(() => {
    documentQuery.data = detail();
    documentQuery.isLoading = false;
    documentQuery.isError = false;
    archive.mutate.mockReset();
    archive.isPending = false;
    archive.isError = false;
    update.mutate.mockReset();
    update.isPending = false;
    update.isError = false;
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

    expect(
      screen.getByText(/não foi possível abrir a página/),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Voltar à biblioteca/ }),
    );

    expect(screen.getByText(/^biblioteca/)).toBeInTheDocument();
  });

  it("when loaded, should show title, type and category", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Práticas da Primeira Maneira" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Categoria" }),
    ).toHaveTextContent("CiênciaDevOps");
    expect(screen.getByText("Resumo")).toBeInTheDocument();
  });

  it("when loaded, should keep the document information out of the page until requested", () => {
    renderPage();

    expect(screen.queryByText("Na biblioteca")).not.toBeInTheDocument();
    expect(screen.queryByText("Situação")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Editar" }),
    ).not.toBeInTheDocument();
  });

  it("when loaded, should render the content as markdown", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Introdução" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "o site" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("when Voltar is clicked, should go back to the previous page", async () => {
    const user = userEvent.setup();
    renderPage(["/library", "/library/id1"], 1);

    await user.click(screen.getByRole("button", { name: /Voltar$/ }));

    expect(screen.getByText(/^biblioteca/)).toBeInTheDocument();
  });

  it("when Sobre a página is clicked, should open the window with status, tags, dates and source", async () => {
    await openAbout();

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Na biblioteca")).toBeInTheDocument();
    expect(within(dialog).getByText("devops")).toBeInTheDocument();
    expect(within(dialog).getByText(/Criado em/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Atualizado em/)).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: /Fonte original/ }),
    ).toHaveAttribute("href", "https://exemplo.com/v.mp4");
  });

  it("when the document is published, should offer edit and remove in the about window", async () => {
    await openAbout();

    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    ).toBeInTheDocument();
  });

  it.each(["pending", "archived"])(
    "when the document is %s, should not offer edit or remove",
    async (status) => {
      documentQuery.data = detail(status);
      const user = userEvent.setup();
      renderPage();
      await user.click(aboutButton());

      expect(
        screen.getByText("Sobre a página", { selector: "h2" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Editar" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Remover da biblioteca/ }),
      ).not.toBeInTheDocument();
    },
  );

  it("when Editar is clicked, should close the about window and open the editor", async () => {
    const user = await openAbout();

    await user.click(screen.getByRole("button", { name: "Editar" }));

    expect(screen.getByText("Editar página")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Situação")).not.toBeInTheDocument(),
    );
  });

  it("when the editor is cancelled, should return to the about window", async () => {
    const user = await openAbout();
    await user.click(screen.getByRole("button", { name: "Editar" }));

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("Editar página")).not.toBeInTheDocument();
    expect(screen.getByText("Situação")).toBeInTheDocument();
  });

  it("when the edit is saved, should return to the about window", async () => {
    update.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const user = await openAbout();
    await user.click(screen.getByRole("button", { name: "Editar" }));

    await user.type(
      screen.getByDisplayValue("Práticas da Primeira Maneira"),
      "!",
    );
    await user.click(screen.getByRole("button", { name: /Salvar alterações/ }));

    expect(screen.queryByText("Editar página")).not.toBeInTheDocument();
    expect(screen.getByText("Situação")).toBeInTheDocument();
  });

  it("when Adicionar a um livro is clicked, should close the about window and open the book picker", async () => {
    const user = await openAbout();

    await user.click(
      screen.getByRole("button", { name: /Adicionar a um livro/ }),
    );

    expect(screen.getByLabelText("Nome do novo livro")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Situação")).not.toBeInTheDocument(),
    );
  });

  it("when the book picker is closed, should return to the about window", async () => {
    const user = await openAbout();
    await user.click(
      screen.getByRole("button", { name: /Adicionar a um livro/ }),
    );

    await user.keyboard("{Escape}");

    expect(
      screen.queryByLabelText("Nome do novo livro"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Situação")).toBeInTheDocument();
  });

  it.each(["pending", "archived"])(
    "when the document is %s, should not offer adding to a book",
    async (status) => {
      documentQuery.data = detail(status);
      const user = userEvent.setup();
      renderPage();
      await user.click(aboutButton());

      expect(
        screen.queryByRole("button", { name: /Adicionar a um livro/ }),
      ).not.toBeInTheDocument();
    },
  );

  it("when removal is requested, should close the about window and ask for confirmation", async () => {
    const user = await openAbout();

    await user.click(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    );

    expect(screen.getByText("Remover da biblioteca?")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Situação")).not.toBeInTheDocument(),
    );
    expect(archive.mutate).not.toHaveBeenCalled();
  });

  it("when the confirmation is cancelled, should return to the about window without archiving", async () => {
    const user = await openAbout();
    await user.click(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(archive.mutate).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Remover da biblioteca?"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Situação")).toBeInTheDocument();
  });

  it("when removal is confirmed, should archive and return to the library on the document category", async () => {
    archive.mutate.mockImplementation(
      (_id: string, options: { onSuccess: () => void }) => options.onSuccess(),
    );
    const user = await openAbout();
    await user.click(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    );

    await user.click(screen.getByRole("button", { name: "Remover" }));

    expect(archive.mutate).toHaveBeenCalledWith("id1", expect.any(Object));
    expect(
      screen.getByText('biblioteca {"category":["Ciência","DevOps"]}'),
    ).toBeInTheDocument();
  });

  it("when removal fails, should show an error in the confirmation and stay on it", async () => {
    archive.isError = true;
    const user = await openAbout();

    await user.click(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    );

    expect(screen.getByText(/Não foi possível remover/)).toBeInTheDocument();
    expect(screen.getByText("Remover da biblioteca?")).toBeInTheDocument();
  });

  it("when the text has two or more headings, should show the Sumário and give the headings ids", () => {
    const value = detail();
    value.content = "# Introdução\n\ntexto\n\n## Detalhes\n\nmais texto";
    documentQuery.data = value;
    renderPage();

    const nav = screen.getByRole("navigation", { name: "Sumário" });

    expect(within(nav).getByText("Detalhes")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Detalhes" })).toHaveAttribute(
      "id",
      "detalhes",
    );
  });

  it("when the text has fewer than two headings, should not show the Sumário", () => {
    renderPage();

    expect(
      screen.queryByRole("navigation", { name: "Sumário" }),
    ).not.toBeInTheDocument();
  });

  it("when loaded, should put title and text on a paper page with margins", () => {
    const { container } = renderPage();

    const page = container.querySelector(
      "[data-slot=paper-page]",
    ) as HTMLElement;

    expect(page).toHaveClass("max-w-3xl", "bg-card");
    expect(
      within(page).getByRole("heading", {
        name: "Práticas da Primeira Maneira",
      }),
    ).toBeInTheDocument();
    expect(
      within(page).getByRole("heading", { name: "Introdução" }),
    ).toBeInTheDocument();
  });

  it("when loaded, should center the title block", () => {
    renderPage();

    const header = screen
      .getByRole("heading", { name: "Práticas da Primeira Maneira" })
      .closest("header");

    expect(header).toHaveClass("text-center");
  });
});

describe("DocumentPage — reading mode", () => {
  beforeEach(() => {
    const value = detail();
    value.content = "# Introdução\n\ntexto\n\n## Detalhes\n\nmais texto";
    documentQuery.data = value;
    documentQuery.isLoading = false;
    documentQuery.isError = false;
  });

  const enterReading = async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

    return user;
  };

  it("when Modo leitura is clicked, should show only the title, the text and the summary", async () => {
    await enterReading();

    const region = screen.getByRole("region", { name: "Modo leitura" });

    expect(
      within(region).getByRole("heading", {
        name: "Práticas da Primeira Maneira",
      }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("heading", { name: "Introdução" }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("navigation", { name: "Sumário" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Sobre a página/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Voltar$/ }),
    ).not.toBeInTheDocument();
  });

  it("when in reading mode, should not repeat the heading ids of the text", async () => {
    await enterReading();

    expect(document.querySelectorAll("#detalhes")).toHaveLength(1);
  });

  it("when a summary item is clicked in reading mode, should scroll to it", async () => {
    const user = await enterReading();
    const target = screen.getByRole("heading", { name: "Detalhes", level: 2 });
    target.scrollIntoView = vi.fn();

    await user.click(
      within(screen.getByRole("navigation", { name: "Sumário" })).getByRole(
        "button",
        { name: "Detalhes" },
      ),
    );

    expect(target.scrollIntoView).toHaveBeenCalled();
  });

  it("when the exit button is clicked, should return to the normal page", async () => {
    const user = await enterReading();

    await user.click(
      screen.getByRole("button", { name: /Sair do modo leitura/ }),
    );

    expect(
      screen.queryByRole("region", { name: "Modo leitura" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sobre a página/ }),
    ).toBeInTheDocument();
  });

  it("when Escape is pressed, should leave the reading mode", async () => {
    const user = await enterReading();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("region", { name: "Modo leitura" }),
    ).not.toBeInTheDocument();
  });

  it("when the text has no headings, should show the reading mode without a summary", async () => {
    documentQuery.data = detail();
    (documentQuery.data as { content: string }).content = "só um parágrafo";
    await enterReading();

    expect(
      screen.queryByRole("navigation", { name: "Sumário" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("só um parágrafo")).toBeInTheDocument();
  });

  it("when a heading is the one being read, should highlight it in the summary", () => {
    // jsdom não tem layout: simula o título 1 no topo e o 2 lá embaixo.
    const tops: Record<string, number> = { introducao: 10, detalhes: 900 };
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        return { top: tops[this.id] ?? 0 } as DOMRect;
      },
    );
    renderPage();

    const nav = screen.getByRole("navigation", { name: "Sumário" });

    expect(
      within(nav).getByRole("button", { name: "Introdução" }),
    ).toHaveAttribute("aria-current", "location");
    expect(
      within(nav).getByRole("button", { name: "Detalhes" }),
    ).not.toHaveAttribute("aria-current");

    vi.restoreAllMocks();
  });
});

describe("DocumentPage — back to top", () => {
  beforeEach(() => {
    documentQuery.data = detail();
    documentQuery.isLoading = false;
    documentQuery.isError = false;
    document.documentElement.scrollTo = vi.fn() as never;
  });

  function scrollDocument(top: number) {
    Object.defineProperty(document.documentElement, "scrollTop", {
      value: top,
      configurable: true,
      writable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("scroll"));
    });
  }

  afterEach(() => scrollDocument(0));

  it("when the page is at the top, should not show the back to top button", () => {
    renderPage();

    expect(
      screen.queryByRole("button", { name: "Voltar ao topo" }),
    ).not.toBeInTheDocument();
  });

  it("when the reader scrolls down a page, should show the button and scroll to the top on click", async () => {
    renderPage();
    scrollDocument(900);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Voltar ao topo" }));

    expect(document.documentElement.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
    expect(
      screen.queryByRole("button", { name: "Voltar ao topo" }),
    ).not.toBeInTheDocument();
  });

  it("when the reader scrolls in reading mode, should also offer the button", async () => {
    renderPage();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /Modo leitura/ }));

    scrollDocument(900);

    expect(
      within(screen.getByRole("region", { name: "Modo leitura" })).getByRole(
        "button",
        { name: "Voltar ao topo" },
      ),
    ).toBeInTheDocument();
  });

  it("when the button is shown, should be fixed in the corner outside the text panel", () => {
    renderPage();
    scrollDocument(900);

    const button = screen.getByRole("button", { name: "Voltar ao topo" });

    expect(button).toHaveClass("fixed", "right-4", "bottom-4");
    expect(
      screen.getByRole("complementary", { name: "Informações da página" }),
    ).not.toContainElement(button);
  });
});
