import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BookCover } from "./BookCover";

const cover = () => screen.getByRole("img", { name: "Capa do livro Pós" });

describe("BookCover — drawn as a book", () => {
  it("when rendered, should draw the page edges behind the cover on the right and at the bottom", () => {
    render(<BookCover title="Pós" kind="pos" />);

    const edges = [...cover().children].filter((node) =>
      node.className.includes("-z-10"),
    );

    expect(edges).toHaveLength(2);
    for (const edge of edges) {
      expect(edge).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("when rendered, should draw the spine with its shadow and crease on the left", () => {
    render(<BookCover title="Pós" kind="pos" />);

    const decorations = cover().querySelector(
      "[class*='overflow-hidden']",
    ) as HTMLElement;

    expect(decorations).toHaveAttribute("aria-hidden", "true");
    expect(decorations.querySelector("[class*='w-4']")).toBeInTheDocument();
    expect(decorations.querySelector("[class*='w-px']")).toBeInTheDocument();
  });

  it("when rendered, should keep the cover face rounded like a hardcover with a stronger shadow", () => {
    render(<BookCover title="Pós" kind="pos" />);

    expect(cover()).toHaveClass("rounded-r-md", "rounded-l-sm", "isolate");
    expect(cover().className).toContain("shadow-[3px_6px_16px");
  });

  it("when rendered, should center the kind, the title and the subtitle", () => {
    render(<BookCover title="Pós" kind="pos" subtitle="Aulas" />);

    const text = cover().querySelector("[class*='text-center']") as HTMLElement;

    expect(text).toHaveTextContent("Pós-graduação");
    expect(text).toHaveTextContent("Pós");
    expect(text).toHaveTextContent("Aulas");
  });

  it("when rendered, should keep the decorations out of the text read by screen readers", () => {
    render(<BookCover title="Pós" kind="pos" />);

    expect(cover()).toHaveAttribute("aria-label", "Capa do livro Pós");
    expect(
      [...cover().querySelectorAll("p")].map(
        (paragraph) => paragraph.textContent,
      ),
    ).toEqual(["Pós-graduação", "Pós"]);
  });

  it("when there is an image, should clip it inside the cover so the page edges stay visible", () => {
    const { container } = render(
      <BookCover title="Pós" kind="pos" imageUrl="https://a.com/capa.jpg" />,
    );

    const image = container.querySelector("img") as HTMLElement;

    expect(image.parentElement).toHaveClass("overflow-hidden");
    expect(cover()).not.toHaveClass("overflow-hidden");
  });
});

describe("BookCover — page edges", () => {
  const edges = () =>
    [...document.querySelectorAll("[data-slot=page-edge]")] as HTMLElement[];

  it("when rendered, should keep two decorative page edges behind the cover, hidden from screen readers", () => {
    render(<BookCover title="Pós" kind="pos" />);

    expect(edges()).toHaveLength(2);
    for (const edge of edges()) {
      expect(edge).toHaveAttribute("aria-hidden", "true");
      expect(edge).toHaveClass("-z-10");
    }
  });

  it("when rendered, should not paint the page edges white nor gold: they carry no color of their own", () => {
    render(<BookCover title="Pós" kind="pos" />);

    for (const edge of edges()) {
      expect(edge.className).not.toMatch(/white|stone|amber|bg-foreground/);
    }
  });

  it("when the book is completed, should show the highlight on the cover frame and not on the edges", () => {
    render(<BookCover title="Pós" kind="pos" completed />);

    expect(cover()).toHaveClass("ring-amber-400");
    for (const edge of edges()) {
      expect(edge.className).not.toMatch(/amber/);
    }
  });

  it("when the completed state is removed, should lose the golden frame", () => {
    const { rerender } = render(<BookCover title="Pós" kind="pos" completed />);

    rerender(<BookCover title="Pós" kind="pos" />);

    expect(cover()).not.toHaveClass("ring-amber-400");
  });
});
