import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";

import type { BookReading } from "../types";

import { BookPrintView } from "./BookPrintView";

const chapter = (documentId: string, title: string, content: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content,
});

const reading: BookReading = {
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
    updatedAt: "2026-03-05T10:00:00.000Z",
  },
  modules: [
    {
      id: "m1",
      title: "Módulo 1",
      chapters: [
        chapter("d1", "Docker", "# Docker\n\ntexto do docker"),
        chapter("d2", "Redes", "# Redes\n\ntexto de redes"),
      ],
    },
    { id: "m2", title: "", chapters: [chapter("d3", "Kubernetes", "# K8s")] },
  ],
};

describe("BookPrintView", () => {
  const print = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    window.print = print;
    document.title = "HomeLab";
  });

  afterEach(() => {
    vi.useRealTimers();
    print.mockReset();
  });

  it("when mounted, should render the print version outside the app with cover, summary and chapters", () => {
    const { container } = render(
      <BookPrintView reading={reading} onDone={() => {}} />,
    );

    const root = document.getElementById("print-root") as HTMLElement;

    expect(container).not.toContainElement(root);
    expect(root.querySelector(".print-cover")).toHaveTextContent(
      "Resumos das aulas",
    );
    expect(root.querySelector(".print-cover")).toHaveTextContent(
      /Exportado em/,
    );
    expect(
      within(root.querySelector(".print-toc") as HTMLElement).getByText(
        "3. Kubernetes",
      ),
    ).toBeInTheDocument();
    expect(root.querySelectorAll(".print-chapter")).toHaveLength(3);
  });

  it("when rendering the chapters, should number them across modules and show the module titles", () => {
    render(<BookPrintView reading={reading} onDone={() => {}} />);

    const labels = [...document.querySelectorAll(".print-chapter-label")].map(
      (label) => label.textContent,
    );

    expect(labels).toEqual([
      "Capítulo 1 · Docker",
      "Capítulo 2 · Redes",
      "Capítulo 3 · Kubernetes",
    ]);
    expect(screen.getAllByText("Módulo 1")).not.toHaveLength(0);
    expect(document.querySelectorAll(".print-module")).toHaveLength(1);
  });

  it("when mounted, should hide the app, name the file after the book and open the print dialog", () => {
    render(<BookPrintView reading={reading} onDone={() => {}} />);

    expect(document.body).toHaveClass("printing-book");
    expect(document.title).toBe("Pós em DevOps");
    expect(print).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(print).toHaveBeenCalledTimes(1);
  });

  it("when the print dialog closes, should report it", () => {
    const onDone = vi.fn();
    render(<BookPrintView reading={reading} onDone={onDone} />);

    act(() => {
      window.dispatchEvent(new Event("afterprint"));
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("when unmounted, should restore the page title, show the app again and not print late", () => {
    const { unmount } = render(
      <BookPrintView reading={reading} onDone={() => {}} />,
    );

    unmount();
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(document.body).not.toHaveClass("printing-book");
    expect(document.title).toBe("HomeLab");
    expect(document.getElementById("print-root")).toBeNull();
    expect(print).not.toHaveBeenCalled();
  });

  it("when the book has no description, should not render an empty paragraph", () => {
    const bare = {
      ...reading,
      book: { ...reading.book, description: "" },
    };
    render(<BookPrintView reading={bare} onDone={() => {}} />);

    expect(document.querySelector(".print-description")).toBeNull();
  });
});
