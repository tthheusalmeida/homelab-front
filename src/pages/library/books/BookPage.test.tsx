import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

const reading = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const detail = { data: undefined as unknown };
const search = { data: undefined as unknown, isFetching: false };
const remove = { mutate: vi.fn(), isPending: false, isError: false };
const setRead = { mutate: vi.fn(), isPending: false, isError: false };
const savePosition = { mutate: vi.fn(), isPending: false, isError: false };
const useBookSearchSpy = vi.fn();

vi.mock("./hooks", () => ({
  useBookReading: () => reading,
  useBook: () => detail,
  useBookSearch: (id: string, q: string) => {
    useBookSearchSpy(id, q);
    return search;
  },
  useDeleteBook: () => remove,
  useSetChapterRead: () => setRead,
  useResetBookProgress: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  useSaveBookPosition: () => savePosition,
  useUpdateBook: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useCreateBook: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useSetBookStructure: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}));
vi.mock("../hooks/useLibrary", () => ({
  useDocuments: () => ({ data: [], isLoading: false }),
}));

import { BookPage } from "./BookPage";

const chapter = (documentId: string, title: string, content: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content,
});

const book = {
  id: "b1",
  title: "Pós em DevOps",
  kind: "pos",
  description: "Resumos das aulas",
  subtitle: "Aulas 1 a 10",
  coverColor: "violet",
  coverImageUrl: "",
  readDocumentIds: [] as string[],
  lastPosition: null as { documentId: string; elementId: string } | null,
  completedAt: null as string | null,
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-05T10:00:00.000Z",
};

const readingData = () => ({
  book,
  modules: [
    {
      id: "m1",
      title: "Módulo 1",
      chapters: [
        chapter("d1", "Docker", "# Docker\n\ntexto\n\n## Imagens\n\nlinha 7"),
        chapter("d2", "Redes", "# Redes\n\nconteúdo de redes"),
      ],
    },
  ],
});

/** Abre o menu "Mais ações" e escolhe um item. */
async function chooseMenuItem(
  user: ReturnType<typeof userEvent.setup>,
  name: RegExp,
) {
  await user.click(screen.getByRole("button", { name: /Mais ações/ }));
  await user.click(await screen.findByRole("menuitem", { name }));
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/library/books/b1"]}>
      <Routes>
        <Route path="/library/books" element={<p>estante</p>} />
        <Route path="/library/books/:bookId" element={<BookPage />} />
        <Route path="/library/:id" element={<p>documento aberto</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("BookPage", () => {
  beforeEach(() => {
    reading.data = readingData();
    reading.isLoading = false;
    reading.isError = false;
    detail.data = {
      ...book,
      modules: [
        {
          id: "m1",
          title: "Módulo 1",
          chapters: [
            {
              documentId: "d1",
              title: "Docker",
              category: [],
              available: true,
            },
          ],
        },
      ],
    };
    search.data = undefined;
    search.isFetching = false;
    remove.mutate.mockReset();
    remove.isError = false;
    setRead.mutate.mockReset();
    savePosition.mutate.mockReset();
    useBookSearchSpy.mockClear();
  });

  it("when loading, should show the loading state", () => {
    reading.isLoading = true;
    reading.data = undefined;
    renderPage();

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("when loading fails, should show the error and a way back", async () => {
    reading.isError = true;
    reading.data = undefined;
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Voltar aos livros/ }));

    expect(screen.getByText("estante")).toBeInTheDocument();
  });

  it("when loaded, should show title, kind, description and the module headings", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Pós em DevOps", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pós-graduação")).toBeInTheDocument();
    expect(screen.getByText("Resumos das aulas")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Módulo 1", level: 2 }),
    ).toBeInTheDocument();
  });

  it("when loaded, should render every chapter in order with its own heading ids", () => {
    renderPage();

    const chapters = screen.getAllByRole("region");

    expect(chapters.map((c) => c.getAttribute("aria-label"))).toEqual([
      "Docker",
      "Redes",
    ]);
    expect(screen.getByRole("heading", { name: "Imagens" })).toHaveAttribute(
      "id",
      "d1-imagens",
    );
    expect(screen.getByRole("heading", { name: "Redes" })).toHaveAttribute(
      "id",
      "d2-redes",
    );
  });

  it("when a chapter is shown, should label it and link to the document", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText("Capítulo 1")).toBeInTheDocument();
    expect(screen.getByText("Capítulo 2")).toBeInTheDocument();

    await user.click(screen.getAllByRole("link", { name: "Abrir página" })[0]);

    expect(screen.getByText("documento aberto")).toBeInTheDocument();
  });

  it("when a chapter is shown, should frame it with a header where it starts and a footer where it ends", () => {
    renderPage();

    const [first, second] = screen.getAllByRole("region");

    expect(first.querySelector("header")).toHaveTextContent("Capítulo 1");
    expect(first.querySelector("header")).toHaveTextContent("Docker");
    expect(first.querySelector("footer")).toHaveTextContent(
      "Fim do capítulo 1",
    );
    expect(second.querySelector("header")).toHaveTextContent("Capítulo 2");
    expect(second.querySelector("footer")).toHaveTextContent(
      "Fim do capítulo 2",
    );
    expect(first).toHaveClass("border-2", "rounded-xl");
  });

  it("when a chapter is shown, should set its text on a paper page", () => {
    renderPage();

    const [first] = screen.getAllByRole("region");
    const page = first.querySelector("[data-slot=paper-page]");

    expect(page).toBeInTheDocument();
  });

  it("when a chapter has a next one, should offer a button to go to it", async () => {
    const user = userEvent.setup();
    renderPage();
    const target = document.getElementById("chapter-d2")!;
    target.scrollIntoView = vi.fn();

    await user.click(screen.getByRole("button", { name: /Próximo: Redes/ }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("when a chapter is the last one, should not offer a next button", () => {
    renderPage();

    expect(
      screen.queryByRole("button", { name: /Próximo: Docker/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Próximo:/ })).toHaveLength(1);
  });

  it("when the book has a module title, should show it as a banner above its chapters", () => {
    renderPage();

    const heading = screen.getByRole("heading", { name: "Módulo 1", level: 2 });

    expect(heading.parentElement).toHaveClass("rounded-xl", "bg-primary/10");
  });

  it("when a summary item is clicked, should scroll to that chapter", async () => {
    const user = userEvent.setup();
    renderPage();
    const target = document.getElementById("chapter-d2")!;
    target.scrollIntoView = vi.fn();

    await user.click(screen.getByRole("button", { name: "2. Redes" }));

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("when a search result is clicked, should scroll to the heading above the match", async () => {
    search.data = [
      {
        documentId: "d1",
        chapterTitle: "Docker",
        moduleId: "m1",
        moduleTitle: "Módulo 1",
        line: 7,
        snippet: "linha 7",
      },
    ];
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Pesquisar no livro"), "linha");
    const heading = screen.getByRole("heading", { name: "Imagens" });
    heading.scrollIntoView = vi.fn();

    await user.click(
      within(
        screen.getByRole("list", { name: "Resultados da pesquisa" }),
      ).getByRole("button"),
    );

    expect(heading.scrollIntoView).toHaveBeenCalled();
  });

  it("when typing in the search, should query the book after the debounce", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText("Pesquisar no livro"), "docker");

    await vi.waitFor(() =>
      expect(useBookSearchSpy).toHaveBeenLastCalledWith("b1", "docker"),
    );
  });

  it("when the book has no available chapters, should show the empty state", () => {
    reading.data = {
      book,
      modules: [{ id: "m1", title: "", chapters: [] }],
    };
    renderPage();

    expect(
      screen.getByText("Este livro ainda não tem capítulos"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", { name: "Painel do livro" }),
    ).not.toBeInTheDocument();
  });

  it("when loaded, should show the book cover with its subtitle above the title", () => {
    renderPage();

    const cover = screen.getByRole("img", {
      name: "Capa do livro Pós em DevOps",
    });

    expect(cover).toHaveTextContent("Aulas 1 a 10");
    expect(cover).toHaveClass("from-violet-600");
  });

  it("when Detalhes is clicked, should open the book sheet with the numbers and structure", async () => {
    const user = userEvent.setup();
    renderPage();

    await chooseMenuItem(user, /Detalhes/);

    expect(screen.getByText("Detalhes do livro")).toBeInTheDocument();
    expect(screen.getByText("Leitura estimada")).toBeInTheDocument();
    expect(
      within(screen.getByRole("dialog")).getByText("1. Docker"),
    ).toBeInTheDocument();
  });

  it("when Modo leitura is clicked, should show only the chapters and the book summary", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

    const region = screen.getByRole("region", { name: "Modo leitura" });

    expect(within(region).getByText("Capítulo 1")).toBeInTheDocument();
    expect(
      within(region).getByRole("navigation", { name: "Sumário do livro" }),
    ).toBeInTheDocument();
    expect(
      within(region).queryByRole("link", { name: "Abrir página" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Organizar/ }),
    ).not.toBeInTheDocument();
    expect(document.querySelectorAll("#d1-imagens")).toHaveLength(1);
  });

  it("when in reading mode, should leave it with the exit button or Escape", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

    await user.click(
      screen.getByRole("button", { name: /Sair do modo leitura/ }),
    );
    expect(
      screen.queryByRole("region", { name: "Modo leitura" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Modo leitura/ }));
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("region", { name: "Modo leitura" }),
    ).not.toBeInTheDocument();
  });

  it("when the book has no chapters, should not offer the reading mode", () => {
    reading.data = { book, modules: [{ id: "m1", title: "", chapters: [] }] };
    renderPage();

    expect(
      screen.queryByRole("button", { name: /Modo leitura/ }),
    ).not.toBeInTheDocument();
  });

  it("when a chapter is the one being read, should highlight it in the summary", () => {
    // jsdom não tem layout: simula o capítulo 1 no topo e o 2 lá embaixo.
    const tops: Record<string, number> = {
      "chapter-d1": 10,
      "chapter-d2": 900,
      "d2-redes": 910,
    };
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        return { top: tops[this.id] ?? 0 } as DOMRect;
      },
    );
    renderPage();

    const nav = screen.getByRole("navigation", { name: "Sumário do livro" });

    expect(
      within(nav).getByRole("button", { name: "1. Docker" }),
    ).toHaveAttribute("aria-current", "location");
    expect(
      within(nav).getByRole("button", { name: "2. Redes" }),
    ).not.toHaveAttribute("aria-current");

    vi.restoreAllMocks();
  });

  it("when Organizar is clicked, should open the organizer", async () => {
    const user = userEvent.setup();
    renderPage();

    await chooseMenuItem(user, /Organizar/);

    expect(screen.getByText(/Organizar “Pós em DevOps”/)).toBeInTheDocument();
  });

  it("when Editar dados is clicked, should open the form filled with the book", async () => {
    const user = userEvent.setup();
    renderPage();

    await chooseMenuItem(user, /Editar dados/);

    expect(screen.getByText("Editar livro")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Pós em DevOps");
  });

  it("when deleting is confirmed, should remove the book and go to the shelf", async () => {
    remove.mutate.mockImplementation(
      (_id: string, options: { onSuccess: () => void }) => options.onSuccess(),
    );
    const user = userEvent.setup();
    renderPage();

    await chooseMenuItem(user, /Excluir livro/);
    expect(screen.getByText("Excluir o livro?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(remove.mutate).toHaveBeenCalledWith("b1", expect.any(Object));
    expect(screen.getByText("estante")).toBeInTheDocument();
  });

  it("when deleting is cancelled, should keep the book", async () => {
    const user = userEvent.setup();
    renderPage();
    await chooseMenuItem(user, /Excluir livro/);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(remove.mutate).not.toHaveBeenCalled();
  });

  it("when deleting fails, should show the error in the confirmation", async () => {
    remove.isError = true;
    const user = userEvent.setup();
    renderPage();

    await chooseMenuItem(user, /Excluir livro/);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Não foi possível excluir o livro/,
    );
  });
});
