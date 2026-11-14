import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { BookReading } from "../types";

import { BookContent } from "./BookContent";

const chapter = (documentId: string, title: string, content: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content,
});

const modules: BookReading["modules"] = [
  {
    id: "m1",
    title: "Módulo 1",
    chapters: [
      chapter("d1", "Docker", "# Docker\n\n## Imagens\n\ntexto"),
      chapter("d2", "Redes", "# Redes\n\nconteúdo"),
    ],
  },
];

const renderContent = (
  props: Partial<React.ComponentProps<typeof BookContent>> = {},
) =>
  render(
    <MemoryRouter>
      <BookContent modules={modules} onGoToChapter={() => {}} {...props} />
    </MemoryRouter>,
  );

describe("BookContent", () => {
  it("when rendered, should frame each chapter with a header and a footer", () => {
    renderContent();

    const [first, second] = screen.getAllByRole("region");

    expect(first.querySelector("header")).toHaveTextContent("Capítulo 1");
    expect(first.querySelector("footer")).toHaveTextContent(
      "Fim do capítulo 1",
    );
    expect(second.querySelector("header")).toHaveTextContent("Capítulo 2");
  });

  it("when a module has a title, should show it as a banner", () => {
    renderContent();

    expect(
      screen.getByRole("heading", { name: "Módulo 1", level: 2 }).parentElement,
    ).toHaveClass("rounded-xl", "bg-primary/10");
  });

  it("when rendered, should give each chapter heading an id prefixed by its document", () => {
    renderContent();

    expect(screen.getByRole("heading", { name: "Imagens" })).toHaveAttribute(
      "id",
      "d1-imagens",
    );
  });

  it("when not in reading mode, should link each chapter to its page and use the small text", () => {
    const { container } = renderContent();

    expect(screen.getAllByRole("link", { name: "Abrir página" })).toHaveLength(
      2,
    );
    expect(container.querySelector(".prose")).toHaveClass("prose-sm");
  });

  it("when in reading mode, should hide the page links and use the base text size", () => {
    const { container } = renderContent({ reading: true });

    expect(
      screen.queryByRole("link", { name: "Abrir página" }),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".prose")).toHaveClass("prose-base");
  });

  it("when a chapter has a next one, should offer to go to it", async () => {
    const onGoToChapter = vi.fn();
    const user = userEvent.setup();
    renderContent({ onGoToChapter });

    await user.click(screen.getByRole("button", { name: /Próximo: Redes/ }));

    expect(onGoToChapter).toHaveBeenCalledWith("d2");
  });

  it("when the chapter is the last one, should not offer a next button", () => {
    renderContent();

    expect(screen.getAllByRole("button", { name: /Próximo:/ })).toHaveLength(1);
  });

  it("when the chapter body is shown, should sit on a transparent sheet inside the frame", () => {
    const { container } = renderContent();

    expect(container.querySelector("[data-slot=paper-page]")).toHaveClass(
      "border-0",
      "shadow-none",
      "bg-transparent",
    );
  });
});
