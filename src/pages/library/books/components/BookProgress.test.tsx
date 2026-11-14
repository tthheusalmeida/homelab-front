import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BookProgress } from "./BookProgress";

describe("BookProgress", () => {
  it("when there is progress, should show the bar and the text with the percentage", () => {
    render(<BookProgress read={3} total={10} />);

    const bar = screen.getByRole("progressbar", {
      name: "Progresso de leitura",
    });

    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
    expect(bar.firstElementChild).toHaveStyle({ width: "30%" });
    expect(
      screen.getByText("3 de 10 capítulo(s) lidos · 30%"),
    ).toBeInTheDocument();
  });

  it("when nothing was read, should show an empty bar at 0%", () => {
    render(<BookProgress read={0} total={4} />);

    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
      width: "0%",
    });
    expect(screen.getByText(/0 de 4/)).toBeInTheDocument();
  });

  it("when the book is completed, should turn golden and say it was completed", () => {
    render(<BookProgress read={4} total={4} completed />);

    expect(screen.getByText("Livro concluído")).toBeInTheDocument();
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(
      "bg-amber-400",
    );
    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
      width: "100%",
    });
  });

  it("when not completed, should use the primary color", () => {
    render(<BookProgress read={1} total={4} />);

    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(
      "bg-primary",
    );
  });

  it("when read is greater than the total, should not pass 100%", () => {
    render(<BookProgress read={9} total={4} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "4",
    );
    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
      width: "100%",
    });
  });

  it("when there is nothing to read, should render nothing", () => {
    const { container } = render(<BookProgress read={0} total={0} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("BookProgress — completion date", () => {
  it("when completed with a date, should say when it was completed", () => {
    render(
      <BookProgress
        read={4}
        total={4}
        completed
        completedAt="2026-11-14T10:00:00.000Z"
      />,
    );

    expect(screen.getByText("Concluído em 14/11/2026")).toBeInTheDocument();
    expect(screen.queryByText("Livro concluído")).not.toBeInTheDocument();
  });

  it("when completed without a date, should keep the generic message", () => {
    render(<BookProgress read={4} total={4} completed />);

    expect(screen.getByText("Livro concluído")).toBeInTheDocument();
  });

  it("when not completed, should ignore the date", () => {
    render(
      <BookProgress
        read={1}
        total={4}
        completedAt="2026-11-14T10:00:00.000Z"
      />,
    );

    expect(screen.getByText(/1 de 4/)).toBeInTheDocument();
  });
});
