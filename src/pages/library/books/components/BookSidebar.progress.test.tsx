import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import type { BookReading } from "../types";

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
    title: "",
    chapters: [chapter("d1", "Docker"), chapter("d2", "Redes")],
  },
];

const renderSidebar = (
  props: Partial<React.ComponentProps<typeof BookSidebar>> = {},
) =>
  render(
    <BookSidebar
      modules={modules}
      query=""
      findBar={<input aria-label="campo de busca" />}
      onSelectChapter={() => {}}
      onSelectHit={() => {}}
      {...props}
    />,
  );

describe("BookSidebar — progress", () => {
  it("when rendered, should show the progress above the summary so it stays in view while scrolling", () => {
    renderSidebar({ readCount: 1 });

    const bar = screen.getByRole("progressbar");
    const summary = screen.getByRole("navigation", {
      name: "Sumário do livro",
    });

    expect(
      bar.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(bar).toHaveAttribute("aria-valuenow", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "2");
  });

  it("when rendered, should keep the progress inside the sticky panel", () => {
    renderSidebar();

    const panel = screen.getByRole("complementary", {
      name: "Painel do livro",
    });

    expect(panel).toHaveClass("lg:sticky");
    expect(within(panel).getByRole("progressbar")).toBeInTheDocument();
  });

  it("when rendered, should put the progress right after the find bar", () => {
    renderSidebar();

    const panel = screen.getByRole("complementary", {
      name: "Painel do livro",
    });

    expect(panel.children[0]).toBe(
      within(panel).getByLabelText("campo de busca"),
    );
    expect(panel.children[1]).toContainElement(screen.getByRole("progressbar"));
  });

  it("when the book is completed, should replace the progress by the completion date", () => {
    renderSidebar({ readCount: 2, completedAt: "2026-11-14T10:00:00.000Z" });

    expect(screen.getByText("Conclusão")).toBeInTheDocument();
    expect(screen.getByText("Concluído em 14/11/2026")).toBeInTheDocument();
    expect(screen.queryByText("Progresso")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("when the book is completed, should keep the card above the summary", () => {
    renderSidebar({ completedAt: "2026-11-14T10:00:00.000Z" });

    const card = screen.getByText("Conclusão").closest("[data-slot=card]")!;
    const summary = screen.getByRole("navigation", {
      name: "Sumário do livro",
    });

    expect(
      card.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("when no chapter was read, should still show an empty progress", () => {
    renderSidebar();

    expect(
      screen.getByText(/0 de 2 capítulo\(s\) lidos · 0%/),
    ).toBeInTheDocument();
  });

  it("when the book has no chapters, should not render the progress card", () => {
    renderSidebar({ modules: [{ id: "m1", title: "", chapters: [] }] });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Progresso")).not.toBeInTheDocument();
  });

  it("when rendered, should title the card Progresso like the Sumário do livro card", () => {
    renderSidebar();

    const progress = screen.getByText("Progresso", {
      selector: "[data-slot=card-title]",
    });
    const summary = screen.getByText("Sumário do livro", {
      selector: "[data-slot=card-title]",
    });

    expect(progress.className).toBe(summary.className);
    expect(progress.closest("[data-slot=card]")).toContainElement(
      screen.getByRole("progressbar"),
    );
  });

  it("when rendered, should keep the progress card lower than the summary card", () => {
    renderSidebar();

    const card = screen
      .getByText("Progresso", { selector: "[data-slot=card-title]" })
      .closest("[data-slot=card]");

    expect(card).toHaveClass("py-3", "gap-2");
    expect(screen.getByRole("progressbar")).toHaveClass("h-1.5");
  });
});
