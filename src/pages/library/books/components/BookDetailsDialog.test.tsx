import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import type { BookReading } from "../types";

import { BookDetailsDialog } from "./BookDetailsDialog";

const chapter = (documentId: string, title: string, content: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content,
});

const reading = (): BookReading => ({
  book: {
    id: "b1",
    title: "Pós em DevOps",
    kind: "pos",
    description: "Resumos das aulas",
    subtitle: "Aulas 1 a 10",
    coverColor: "violet",
    coverImageUrl: "",
    readDocumentIds: [],
    lastPosition: null,
    completedAt: null,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-06T10:00:00.000Z",
  },
  modules: [
    {
      id: "m1",
      title: "Módulo 1",
      chapters: [
        chapter("a", "Docker", "um dois três quatro"),
        chapter("b", "Redes", "cinco seis"),
      ],
    },
    { id: "m2", title: "", chapters: [chapter("c", "Kubernetes", "sete")] },
  ],
});

const renderDialog = (value = reading(), open = true) =>
  render(
    <BookDetailsDialog open={open} onOpenChange={() => {}} reading={value} />,
  );

describe("BookDetailsDialog", () => {
  it("when open, should show the cover and the book data", () => {
    renderDialog();

    expect(
      screen.getByRole("img", { name: "Capa do livro Pós em DevOps" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pós em DevOps" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Resumos das aulas")).toBeInTheDocument();
    expect(screen.getAllByText("Aulas 1 a 10").length).toBeGreaterThan(0);
  });

  it("when open, should show the reading numbers", () => {
    renderDialog();

    const facts = screen.getByText("Módulos").closest("dl") as HTMLElement;

    expect(within(facts).getByText("Módulos").nextSibling).toHaveTextContent(
      "2",
    );
    expect(within(facts).getByText("Capítulos").nextSibling).toHaveTextContent(
      "3",
    );
    expect(within(facts).getByText("Palavras").nextSibling).toHaveTextContent(
      "7",
    );
    expect(
      within(facts).getByText("Leitura estimada").nextSibling,
    ).toHaveTextContent("1 min");
    expect(within(facts).getByText(/Criado em/)).toBeInTheDocument();
    expect(within(facts).getByText(/Atualizado em/)).toBeInTheDocument();
  });

  it("when open, should list the structure with words per chapter", () => {
    renderDialog();

    const structure = within(
      screen.getByRole("region", { name: "Estrutura do livro" }),
    );

    expect(structure.getByText("Módulo 1")).toBeInTheDocument();
    expect(structure.getByText("1. Docker")).toBeInTheDocument();
    expect(structure.getByText("4 palavras")).toBeInTheDocument();
    expect(structure.getByText("3. Kubernetes")).toBeInTheDocument();
  });

  it("when the book has no chapters, should say so", () => {
    const value = reading();
    value.modules = [{ id: "m1", title: "", chapters: [] }];
    renderDialog(value);

    expect(
      screen.getByText("Este livro ainda não tem capítulos."),
    ).toBeInTheDocument();
  });

  it("when closed, should render nothing", () => {
    renderDialog(reading(), false);

    expect(screen.queryByText("Detalhes do livro")).not.toBeInTheDocument();
  });
});
