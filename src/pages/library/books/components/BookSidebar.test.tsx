import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { BookReading, BookSearchHit } from "../types";

import { BookSidebar } from "./BookSidebar";

const chapter = (documentId: string, title: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content: "",
});

const modules: BookReading["modules"] = [
  {
    id: "m1",
    title: "Módulo 1",
    chapters: [chapter("d1", "Docker"), chapter("d2", "Redes")],
  },
  { id: "m2", title: "", chapters: [chapter("d3", "Kubernetes")] },
];

const hit: BookSearchHit = {
  documentId: "d1",
  chapterTitle: "Docker",
  moduleId: "m1",
  moduleTitle: "Módulo 1",
  line: 5,
  snippet: "Uma imagem é construída",
};

const setup = (
  props: Partial<React.ComponentProps<typeof BookSidebar>> = {},
) => {
  const handlers = {
    onSelectChapter: vi.fn(),
    onSelectHit: vi.fn(),
  };

  render(
    <BookSidebar
      modules={modules}
      query=""
      findBar={<input aria-label="campo de busca" />}
      {...handlers}
      {...props}
    />,
  );

  return { ...handlers, user: userEvent.setup() };
};

describe("BookSidebar", () => {
  it("when rendered, should list modules and numbered chapters in the summary", () => {
    setup();

    const nav = screen.getByRole("navigation", { name: "Sumário do livro" });

    expect(within(nav).getByText("Módulo 1")).toBeInTheDocument();
    expect(within(nav).getByText("1. Docker")).toBeInTheDocument();
    expect(within(nav).getByText("2. Redes")).toBeInTheDocument();
    expect(within(nav).getByText("3. Kubernetes")).toBeInTheDocument();
  });

  it("when a chapter is clicked, should select it", async () => {
    const { onSelectChapter, user } = setup();

    await user.click(screen.getByRole("button", { name: "2. Redes" }));

    expect(onSelectChapter).toHaveBeenCalledWith("d2");
  });

  it("when rendered, should show the given find bar at the top", () => {
    setup();

    const aside = screen.getByRole("complementary", {
      name: "Painel do livro",
    });

    expect(aside.firstElementChild).toBe(
      within(aside).getByLabelText("campo de busca"),
    );
  });

  it("when the query is short, should not show the results card", () => {
    setup({ query: "d" });

    expect(screen.queryByText(/resultado/)).not.toBeInTheDocument();
  });

  it("when searching, should say it is searching", () => {
    setup({ query: "docker", isSearching: true });

    expect(screen.getByText("Pesquisando...")).toBeInTheDocument();
  });

  it("when there are results, should list chapter, module and snippet and select on click", async () => {
    const { onSelectHit, user } = setup({ query: "imagem", hits: [hit] });

    expect(screen.getByText("1 resultado(s)")).toBeInTheDocument();

    const list = screen.getByRole("list", { name: "Resultados da pesquisa" });

    expect(
      within(list).getByText("Uma imagem é construída"),
    ).toBeInTheDocument();
    expect(within(list).getByText(/Módulo 1/)).toBeInTheDocument();

    await user.click(within(list).getByRole("button"));

    expect(onSelectHit).toHaveBeenCalledWith(hit);
  });

  it("when nothing matches, should say so", () => {
    setup({ query: "zzz", hits: [] });

    expect(
      screen.getByText("Nada encontrado neste livro."),
    ).toBeInTheDocument();
  });

  it("when wide, should be sticky on the right side", () => {
    setup();

    expect(
      screen.getByRole("complementary", { name: "Painel do livro" }),
    ).toHaveClass("lg:sticky", "lg:top-4", "lg:self-start");
  });
});

describe("BookSidebar — active chapter", () => {
  it("when a chapter is being read, should highlight it in the summary", () => {
    render(
      <BookSidebar
        modules={modules}
        activeChapterId="d2"
        query=""
        findBar={null}
        onSelectChapter={() => {}}
        onSelectHit={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "2. Redes" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(
      screen.getByRole("button", { name: "1. Docker" }),
    ).not.toHaveAttribute("aria-current");
  });
});

describe("BookSidebar — read chapters", () => {
  it("when chapters were read, should mark them in the summary", () => {
    render(
      <BookSidebar
        modules={modules}
        readIds={["d1"]}
        query=""
        findBar={null}
        onSelectChapter={() => {}}
        onSelectHit={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "1. Docker, lido" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2. Redes" }),
    ).toBeInTheDocument();
  });
});
