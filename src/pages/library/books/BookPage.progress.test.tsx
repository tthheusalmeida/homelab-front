import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

const reading = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};
const search = { data: undefined as unknown, isFetching: false };
const setRead = { mutate: vi.fn(), isPending: false, isError: false };
const savePosition = { mutate: vi.fn(), isPending: false, isError: false };
const idle = { mutate: vi.fn(), isPending: false, isError: false };
const reset = { mutate: vi.fn(), isPending: false, isError: false };

vi.mock("./hooks", () => ({
  useBookReading: () => reading,
  useBook: () => ({ data: undefined }),
  useBookSearch: () => search,
  useDeleteBook: () => idle,
  useSetChapterRead: () => setRead,
  useResetBookProgress: () => reset,
  useSaveBookPosition: () => savePosition,
  useUpdateBook: () => idle,
  useCreateBook: () => idle,
  useSetBookStructure: () => idle,
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

const bookMeta = (overrides = {}) => ({
  id: "b1",
  title: "Pós em DevOps",
  kind: "pos",
  description: "",
  subtitle: "",
  coverColor: "blue",
  coverImageUrl: "",
  readDocumentIds: [] as string[],
  lastPosition: null as { documentId: string; elementId: string } | null,
  completedAt: null as string | null,
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-05T10:00:00.000Z",
  ...overrides,
});

const readingData = (overrides = {}) => ({
  book: bookMeta(overrides),
  modules: [
    {
      id: "m1",
      title: "",
      chapters: [
        chapter("d1", "Docker", "# Docker\n\ntexto\n\n## Imagens\n\nlinha 7"),
        chapter("d2", "Redes", "# Redes\n\nconteúdo de redes"),
      ],
    },
  ],
});

function Where() {
  const location = useLocation();

  return <p data-testid="where">{location.pathname + location.search}</p>;
}

const renderPage = (path = "/library/books/b1") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Where />
      <Routes>
        <Route path="/library/books/:bookId" element={<BookPage />} />
      </Routes>
    </MemoryRouter>,
  );

const immediateFrames = () =>
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });

describe("BookPage — progress, continue, find, export", () => {
  beforeEach(() => {
    reading.data = readingData();
    reading.isLoading = false;
    reading.isError = false;
    search.data = undefined;
    setRead.mutate.mockReset();
    savePosition.mutate.mockReset();
    reset.mutate.mockReset();
    reset.isPending = false;
    reset.isError = false;
    window.print = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("progress", () => {
    it("when some chapters were read, should show the progress bar", () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      renderPage();

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "1",
      );
      expect(
        screen.getByText("1 de 2 capítulo(s) lidos · 50%"),
      ).toBeInTheDocument();
    });

    it("when the book is open, should keep the progress in the side panel and not in the header", () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      renderPage();

      const panel = screen.getByRole("complementary", {
        name: "Painel do livro",
      });
      const header = screen
        .getByRole("heading", { name: "Pós em DevOps", level: 1 })
        .closest("header") as HTMLElement;

      expect(within(panel).getByRole("progressbar")).toBeInTheDocument();
      expect(within(header).queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getAllByRole("progressbar")).toHaveLength(1);
    });

    it("when in reading mode, should show the progress above the summary", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

      const aside = screen.getByRole("complementary", {
        name: "Sumário da leitura",
      });
      const bar = within(aside).getByRole("progressbar");
      const summary = within(aside).getByRole("navigation", {
        name: "Sumário do livro",
      });

      expect(bar).toHaveAttribute("aria-valuenow", "1");
      expect(
        bar.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("when a read chapter is no longer in the book, should not count it", () => {
      reading.data = readingData({ readDocumentIds: ["d1", "fora"] });
      renderPage();

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "1",
      );
    });

    it("when the book is completed, should show the completion date instead of the progress in the side panel", () => {
      reading.data = readingData({
        readDocumentIds: ["d1", "d2"],
        completedAt: "2026-11-14T10:00:00.000Z",
      });
      renderPage();

      const panel = screen.getByRole("complementary", {
        name: "Painel do livro",
      });

      expect(within(panel).getByText("Conclusão")).toBeInTheDocument();
      expect(
        within(panel).getByText("Concluído em 14/11/2026"),
      ).toBeInTheDocument();
      expect(within(panel).queryByText("Progresso")).not.toBeInTheDocument();
      expect(within(panel).queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("when the book is completed, should not repeat the date in the header", () => {
      reading.data = readingData({
        readDocumentIds: ["d1", "d2"],
        completedAt: "2026-11-14T10:00:00.000Z",
      });
      renderPage();

      expect(screen.getAllByText(/Concluído em/)).toHaveLength(1);
    });

    it("when the book is completed and in reading mode, should show the date above the summary", async () => {
      reading.data = readingData({
        readDocumentIds: ["d1", "d2"],
        completedAt: "2026-11-14T10:00:00.000Z",
      });
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

      const aside = screen.getByRole("complementary", {
        name: "Sumário da leitura",
      });

      expect(
        within(aside).getByText("Concluído em 14/11/2026"),
      ).toBeInTheDocument();
      expect(within(aside).queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("when the book is completed, should show the golden cover", () => {
      reading.data = readingData({
        readDocumentIds: ["d1", "d2"],
        completedAt: "2026-11-14T10:00:00.000Z",
      });
      renderPage();

      expect(
        screen.getByRole("img", { name: "Capa do livro Pós em DevOps" }),
      ).toHaveClass("ring-amber-400");
    });

    it("when the book is not completed, should not show the completed badge", () => {
      renderPage();

      expect(screen.queryByText(/Concluído em/)).not.toBeInTheDocument();
    });

    it("when a chapter is marked, should ask the server to mark that chapter of this book", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(
        screen.getAllByRole("button", { name: /Marcar como lido/ })[0],
      );

      expect(setRead.mutate).toHaveBeenCalledWith(
        { id: "b1", documentId: "d1", read: true },
        expect.any(Object),
      );
    });

    it("when a read chapter is clicked again, should ask to unmark it", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: /^Lido$/ }));

      expect(setRead.mutate).toHaveBeenCalledWith(
        { id: "b1", documentId: "d1", read: false },
        expect.any(Object),
      );
    });

    it("when the last chapter is read and the book becomes completed, should celebrate", async () => {
      setRead.mutate.mockImplementation(
        (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
          options.onSuccess({ completedAt: "2026-11-14T10:00:00.000Z" }),
      );
      const user = userEvent.setup();
      renderPage();

      await user.click(
        screen.getAllByRole("button", { name: /Marcar como lido/ })[1],
      );

      expect(await screen.findByText("Livro concluído!")).toBeInTheDocument();
      expect(
        screen.getByText("Você leu todos os capítulos de “Pós em DevOps”."),
      ).toBeInTheDocument();
    });

    it("when a chapter is read but the book is still incomplete, should not celebrate", async () => {
      setRead.mutate.mockImplementation(
        (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
          options.onSuccess({ completedAt: null }),
      );
      const user = userEvent.setup();
      renderPage();

      await user.click(
        screen.getAllByRole("button", { name: /Marcar como lido/ })[0],
      );

      expect(screen.queryByText("Livro concluído!")).not.toBeInTheDocument();
    });

    it("when the book was already completed and another chapter is toggled, should not celebrate again", async () => {
      reading.data = readingData({
        readDocumentIds: ["d1", "d2"],
        completedAt: "2026-11-14T10:00:00.000Z",
      });
      setRead.mutate.mockImplementation(
        (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
          options.onSuccess({ completedAt: "2026-11-14T10:00:00.000Z" }),
      );
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getAllByRole("button", { name: /^Lido$/ })[0]);

      expect(screen.queryByText("Livro concluído!")).not.toBeInTheDocument();
    });

    it("when the celebration is dismissed, should close it", async () => {
      setRead.mutate.mockImplementation(
        (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
          options.onSuccess({ completedAt: "2026-11-14T10:00:00.000Z" }),
      );
      const user = userEvent.setup();
      renderPage();
      await user.click(
        screen.getAllByRole("button", { name: /Marcar como lido/ })[1],
      );

      await user.click(
        await screen.findByRole("button", { name: "Continuar" }),
      );

      await waitFor(() =>
        expect(screen.queryByText("Livro concluído!")).not.toBeInTheDocument(),
      );
    });

    it("when a chapter is marked in reading mode and completes the book, should celebrate there too", async () => {
      setRead.mutate.mockImplementation(
        (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
          options.onSuccess({ completedAt: "2026-11-14T10:00:00.000Z" }),
      );
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

      await user.click(
        screen.getAllByRole("button", { name: /Marcar como lido/ })[1],
      );

      expect(await screen.findByText("Livro concluído!")).toBeInTheDocument();
    });

    it("when chapters are read, should mark them with a check in the summary", () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      renderPage();

      expect(
        screen.getByRole("button", { name: "1. Docker, lido" }),
      ).toBeInTheDocument();
    });
  });

  describe("header actions", () => {
    it("when opened, should keep only the main actions visible and the others in the menu", async () => {
      const user = userEvent.setup();
      renderPage();

      expect(
        screen.getByRole("button", { name: /Modo leitura/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Mais ações/ }),
      ).toBeInTheDocument();
      for (const name of [
        /Detalhes/,
        /Organizar/,
        /Editar dados/,
        /Exportar/,
        /Excluir livro/,
      ]) {
        expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
      }

      await user.click(screen.getByRole("button", { name: /Mais ações/ }));

      for (const name of [
        /Detalhes/,
        /Organizar/,
        /Editar dados e capa/,
        /Exportar PDF/,
        /Excluir livro/,
      ]) {
        expect(
          await screen.findByRole("menuitem", { name }),
        ).toBeInTheDocument();
      }
    });

    it("when the book has no chapters, should not offer reading mode or export", async () => {
      reading.data = {
        book: bookMeta(),
        modules: [{ id: "m1", title: "", chapters: [] }],
      };
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: /Mais ações/ }));

      expect(
        screen.queryByRole("button", { name: /Modo leitura/ }),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByRole("menuitem", { name: /Organizar/ }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("menuitem", { name: /Exportar PDF/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("reset progress", () => {
    const openMenu = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByRole("button", { name: /Mais ações/ }));

    it("when the book has progress, should offer Zerar progresso in the menu", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      const user = userEvent.setup();
      renderPage();

      await openMenu(user);

      expect(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      ).not.toHaveAttribute("aria-disabled", "true");
    });

    it("when only the saved position exists, should also allow resetting", async () => {
      reading.data = readingData({
        lastPosition: { documentId: "d1", elementId: "d1-imagens" },
      });
      const user = userEvent.setup();
      renderPage();

      await openMenu(user);

      expect(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      ).not.toHaveAttribute("aria-disabled", "true");
    });

    it("when the book has no progress at all, should show it disabled", async () => {
      const user = userEvent.setup();
      renderPage();

      await openMenu(user);

      expect(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      ).toHaveAttribute("aria-disabled", "true");
    });

    it("when Zerar progresso is chosen, should ask for confirmation before doing anything", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      const user = userEvent.setup();
      renderPage();
      await openMenu(user);

      await user.click(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      );

      expect(screen.getByText("Zerar o progresso?")).toBeInTheDocument();
      expect(
        screen.getByText(/Todos os capítulos voltam a não lidos/),
      ).toBeInTheDocument();
      expect(reset.mutate).not.toHaveBeenCalled();
    });

    it("when the confirmation is accepted, should reset this book and close", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      reset.mutate.mockImplementation(
        (_id: string, options: { onSuccess: () => void }) =>
          options.onSuccess(),
      );
      const user = userEvent.setup();
      renderPage();
      await openMenu(user);
      await user.click(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      );

      await user.click(screen.getByRole("button", { name: "Zerar progresso" }));

      expect(reset.mutate).toHaveBeenCalledWith("b1", expect.any(Object));
      await waitFor(() =>
        expect(
          screen.queryByText("Zerar o progresso?"),
        ).not.toBeInTheDocument(),
      );
    });

    it("when the confirmation is cancelled, should not reset", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      const user = userEvent.setup();
      renderPage();
      await openMenu(user);
      await user.click(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      );

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(reset.mutate).not.toHaveBeenCalled();
    });

    it("when resetting fails, should keep the confirmation open with an error", async () => {
      reading.data = readingData({ readDocumentIds: ["d1"] });
      reset.isError = true;
      const user = userEvent.setup();
      renderPage();
      await openMenu(user);

      await user.click(
        await screen.findByRole("menuitem", { name: /Zerar progresso/ }),
      );

      expect(screen.getByRole("alert")).toHaveTextContent(
        /Não foi possível zerar o progresso/,
      );
      expect(screen.getByText("Zerar o progresso?")).toBeInTheDocument();
    });
  });

  describe("continue where it stopped", () => {
    const withPosition = () =>
      readingData({
        lastPosition: { documentId: "d1", elementId: "d1-imagens" },
      });

    it("when there is a saved position, should offer to continue and make it the main action", () => {
      reading.data = withPosition();
      renderPage();

      expect(
        screen.getByRole("button", { name: /Continuar de onde parou/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Modo leitura/ })).toHaveClass(
        "border",
      );
    });

    it("when there is no saved position, should not offer to continue", () => {
      renderPage();

      expect(
        screen.queryByRole("button", { name: /Continuar de onde parou/ }),
      ).not.toBeInTheDocument();
    });

    it("when Continuar de onde parou is clicked, should scroll to the saved heading", async () => {
      reading.data = withPosition();
      const user = userEvent.setup();
      renderPage();
      const target = document.getElementById("d1-imagens")!;
      target.scrollIntoView = vi.fn();

      await user.click(
        screen.getByRole("button", { name: /Continuar de onde parou/ }),
      );

      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    it("when the saved heading no longer exists, should scroll to the start of its chapter", async () => {
      reading.data = readingData({
        lastPosition: { documentId: "d2", elementId: "d2-sumiu" },
      });
      const user = userEvent.setup();
      renderPage();
      const chapterBlock = document.getElementById("chapter-d2")!;
      chapterBlock.scrollIntoView = vi.fn();

      await user.click(
        screen.getByRole("button", { name: /Continuar de onde parou/ }),
      );

      expect(chapterBlock.scrollIntoView).toHaveBeenCalled();
    });

    it("when opened from the shelf with continuar=1, should scroll to the saved point once and clean the address", async () => {
      immediateFrames();
      reading.data = withPosition();
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;

      renderPage("/library/books/b1?continuar=1");

      await waitFor(() => expect(scroll).toHaveBeenCalledTimes(1));
      expect(screen.getByTestId("where")).toHaveTextContent(
        /^\/library\/books\/b1$/,
      );

      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    });

    it("when opened without continuar, should not scroll by itself", () => {
      immediateFrames();
      reading.data = withPosition();
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;

      renderPage();

      expect(scroll).not.toHaveBeenCalled();

      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    });
  });

  describe("saving the reading position", () => {
    function mockLayout(tops: Record<string, number>) {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
        function (this: Element) {
          return { top: tops[this.id] ?? 900 } as DOMRect;
        },
      );
    }

    it("when the page opens without scrolling, should not save anything", () => {
      vi.useFakeTimers();
      immediateFrames();
      mockLayout({ "chapter-d1": 10 });
      renderPage();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(savePosition.mutate).not.toHaveBeenCalled();
    });

    it("when the reader scrolls and rests on a new place, should save it after a pause", () => {
      vi.useFakeTimers();
      immediateFrames();
      mockLayout({ "chapter-d1": 10 });
      renderPage();

      mockLayout({ "chapter-d1": -500, "d1-imagens": -100, "chapter-d2": 800 });
      act(() => {
        document.dispatchEvent(new Event("scroll"));
      });

      expect(savePosition.mutate).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1600);
      });

      expect(savePosition.mutate).toHaveBeenCalledWith({
        id: "b1",
        position: { documentId: "d1", elementId: "d1-imagens" },
      });
    });

    it("when the reader keeps moving, should wait for the pause and save only the last place", () => {
      // Com timers falsos o requestAnimationFrame também é falso (16 ms).
      vi.useFakeTimers();
      mockLayout({ "chapter-d1": 10 });
      renderPage();

      mockLayout({ "chapter-d1": -500, "d1-imagens": -100, "chapter-d2": 800 });
      act(() => {
        document.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(20);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      mockLayout({ "chapter-d1": -900, "d1-imagens": -600, "chapter-d2": 50 });
      act(() => {
        document.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(20);
      });
      act(() => {
        vi.advanceTimersByTime(1600);
      });

      expect(savePosition.mutate).toHaveBeenCalledTimes(1);
      expect(savePosition.mutate).toHaveBeenCalledWith({
        id: "b1",
        position: { documentId: "d2", elementId: "chapter-d2" },
      });
    });

    it("when the reader rests on the place already saved, should not save again", () => {
      vi.useFakeTimers();
      immediateFrames();
      reading.data = readingData({
        lastPosition: { documentId: "d1", elementId: "d1-imagens" },
      });
      mockLayout({ "chapter-d1": -500, "d1-imagens": -100, "chapter-d2": 800 });
      renderPage();

      act(() => {
        document.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(3000);
      });

      expect(savePosition.mutate).not.toHaveBeenCalled();
    });
  });

  describe("find in the book", () => {
    it("when Ctrl+K is pressed, should focus the search field", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.keyboard("{Control>}k{/Control}");

      expect(screen.getByLabelText("Pesquisar no livro")).toHaveFocus();
    });

    it("when Cmd+K is pressed, should also focus the search field", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.keyboard("{Meta>}k{/Meta}");

      expect(screen.getByLabelText("Pesquisar no livro")).toHaveFocus();
    });

    it("when searching, should count the occurrences in the text and move with Enter", async () => {
      Element.prototype.scrollIntoView = vi.fn();
      reading.data = {
        book: bookMeta(),
        modules: [
          {
            id: "m1",
            title: "",
            chapters: [
              chapter("d1", "Docker", "# Docker\n\numa imagem e outra imagem"),
              chapter("d2", "Redes", "# Redes\n\nmais uma imagem aqui"),
            ],
          },
        ],
      };
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText("Pesquisar no livro"), "imagem");

      expect(await screen.findByText("1 de 3")).toBeInTheDocument();

      await user.keyboard("{Enter}");

      expect(await screen.findByText("2 de 3")).toBeInTheDocument();

      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    });

    it("when in reading mode, should keep the search in the top bar and Ctrl+K should focus it", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

      const region = screen.getByRole("region", { name: "Modo leitura" });

      expect(
        within(region).getByLabelText("Pesquisar no livro"),
      ).toBeInTheDocument();

      await user.keyboard("{Control>}k{/Control}");

      expect(within(region).getByLabelText("Pesquisar no livro")).toHaveFocus();
    });

    it("when the search is cleared, should drop the counter", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByLabelText("Pesquisar no livro"), "docker");
      await screen.findByText(/de \d+/);
      await user.type(screen.getByLabelText("Pesquisar no livro"), "{Escape}");

      await waitFor(() =>
        expect(screen.queryByText(/ de \d+$/)).not.toBeInTheDocument(),
      );
    });
  });

  describe("export to PDF", () => {
    it("when Exportar PDF is chosen, should render the print version and open the print dialog", async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole("button", { name: /Mais ações/ }));
      await user.click(
        await screen.findByRole("menuitem", { name: /Exportar PDF/ }),
      );

      expect(document.getElementById("print-root")).toBeInTheDocument();
      expect(document.body).toHaveClass("printing-book");
      await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
    });

    it("when the print dialog closes, should remove the print version", async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole("button", { name: /Mais ações/ }));
      await user.click(
        await screen.findByRole("menuitem", { name: /Exportar PDF/ }),
      );

      act(() => {
        window.dispatchEvent(new Event("afterprint"));
      });

      expect(document.getElementById("print-root")).not.toBeInTheDocument();
      expect(document.body).not.toHaveClass("printing-book");
    });

    it("when the page is only displayed, should not render the print version", () => {
      renderPage();

      expect(document.getElementById("print-root")).not.toBeInTheDocument();
    });
  });
});

describe("BookPage — back to top", () => {
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

  beforeEach(() => {
    reading.data = readingData();
    reading.isLoading = false;
    reading.isError = false;
    search.data = undefined;
    document.documentElement.scrollTo = vi.fn() as never;
  });

  afterEach(() => {
    scrollDocument(0);
  });

  it("when the reader is at the top, should not show the button", () => {
    renderPage();

    expect(
      screen.queryByRole("button", { name: "Voltar ao topo" }),
    ).not.toBeInTheDocument();
  });

  it("when the reader scrolls down, should show the button fixed in the right corner, outside the text and the side panel", () => {
    renderPage();

    scrollDocument(900);

    const button = screen.getByRole("button", { name: "Voltar ao topo" });
    const panel = screen.getByRole("complementary", {
      name: "Painel do livro",
    });

    expect(panel).not.toContainElement(button);
    expect(button).toHaveClass("fixed", "right-4", "bottom-4");
    expect(screen.getByRole("region", { name: "Docker" })).not.toContainElement(
      button,
    );
  });

  it("when the button is clicked, should scroll back to the top", async () => {
    renderPage();
    scrollDocument(900);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Voltar ao topo" }));

    expect(document.documentElement.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("when the button is shown, should keep the summary, progress and search in the side panel", () => {
    renderPage();

    scrollDocument(900);

    const panel = within(
      screen.getByRole("complementary", { name: "Painel do livro" }),
    );

    expect(panel.getByRole("progressbar")).toBeInTheDocument();
    expect(
      panel.getByRole("navigation", { name: "Sumário do livro" }),
    ).toBeInTheDocument();
    expect(panel.getByLabelText("Pesquisar no livro")).toBeInTheDocument();
  });

  it("when in reading mode, should also offer the button in the text column", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

    scrollDocument(900);

    const region = screen.getByRole("region", { name: "Modo leitura" });

    expect(
      within(region).getByRole("button", { name: "Voltar ao topo" }),
    ).toBeInTheDocument();
  });
});
