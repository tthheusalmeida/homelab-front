import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BookProgressCard } from "./BookProgressCard";

describe("BookProgressCard", () => {
  it("when the book is in progress, should show the Progresso title with the bar", () => {
    render(<BookProgressCard read={3} total={10} />);

    expect(
      screen.getByText("Progresso", { selector: "[data-slot=card-title]" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "3",
    );
    expect(
      screen.getByText("3 de 10 capítulo(s) lidos · 30%"),
    ).toBeInTheDocument();
  });

  it("when the book is completed, should show only when it was completed", () => {
    render(
      <BookProgressCard
        read={10}
        total={10}
        completedAt="2026-11-14T10:00:00.000Z"
      />,
    );

    expect(
      screen.getByText("Conclusão", { selector: "[data-slot=card-title]" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Concluído em 14/11/2026")).toBeInTheDocument();
    expect(screen.queryByText("Progresso")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText(/capítulo\(s\) lidos/)).not.toBeInTheDocument();
  });

  it("when completedAt is null, should still show the progress", () => {
    render(<BookProgressCard read={1} total={2} completedAt={null} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("when there is nothing to read, should render nothing", () => {
    const { container } = render(<BookProgressCard read={0} total={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("when shown in either state, should use the compact card spacing", () => {
    const { rerender } = render(<BookProgressCard read={1} total={2} />);

    expect(document.querySelector("[data-slot=card]")).toHaveClass(
      "py-3",
      "gap-2",
    );

    rerender(
      <BookProgressCard
        read={2}
        total={2}
        completedAt="2026-11-14T10:00:00.000Z"
      />,
    );

    expect(document.querySelector("[data-slot=card]")).toHaveClass(
      "py-3",
      "gap-2",
    );
  });
});

describe("BookProgressCard — stable height", () => {
  const card = () => document.querySelector("[data-slot=card]") as HTMLElement;

  it("when in progress, should have a minimum height", () => {
    render(<BookProgressCard read={1} total={2} />);

    expect(card()).toHaveClass("min-h-24");
  });

  it("when completed, should have the same minimum height so the panel does not jump", () => {
    render(
      <BookProgressCard
        read={2}
        total={2}
        completedAt="2026-11-14T10:00:00.000Z"
      />,
    );

    expect(card()).toHaveClass("min-h-24");
  });

  it("when switching between progress and completion, should keep the same height classes", () => {
    const { rerender } = render(<BookProgressCard read={1} total={2} />);
    const before = card().className;

    rerender(
      <BookProgressCard
        read={2}
        total={2}
        completedAt="2026-11-14T10:00:00.000Z"
      />,
    );

    expect(card().className).toBe(before);
  });
});
