import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { BookCover } from "./BookCover";

const cover = () => screen.getByRole("img", { name: "Capa do livro Pós" });

describe("BookCover", () => {
  it("when rendered, should show the kind, the title and the subtitle", () => {
    render(<BookCover title="Pós" kind="pos" subtitle="Aulas 1 a 10" />);

    expect(cover()).toHaveTextContent("Pós-graduação");
    expect(cover()).toHaveTextContent("Pós");
    expect(cover()).toHaveTextContent("Aulas 1 a 10");
  });

  it("when there is no subtitle, should not render an empty line", () => {
    render(<BookCover title="Pós" kind="book" />);

    expect(cover().querySelectorAll("p")).toHaveLength(2);
  });

  it("when a color is given, should use its gradient", () => {
    render(<BookCover title="Pós" kind="pos" color="rose" />);

    expect(cover()).toHaveClass("from-rose-600", "to-rose-900");
  });

  it("when no color is given, should use the default gradient", () => {
    render(<BookCover title="Pós" kind="pos" />);

    expect(cover()).toHaveClass("from-blue-600");
  });

  it("when there is an image url, should show the image", () => {
    const { container } = render(
      <BookCover title="Pós" kind="pos" imageUrl="https://a.com/capa.jpg" />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://a.com/capa.jpg",
    );
  });

  it("when there is no image url, should show only the color", () => {
    const { container } = render(<BookCover title="Pós" kind="pos" />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("when the image fails to load, should fall back to the color", () => {
    const { container } = render(
      <BookCover
        title="Pós"
        kind="pos"
        imageUrl="https://a.com/quebrada.jpg"
      />,
    );

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(cover()).toHaveTextContent("Pós");
  });

  it("when the image url changes after a failure, should try the new image", () => {
    const { container, rerender } = render(
      <BookCover
        title="Pós"
        kind="pos"
        imageUrl="https://a.com/quebrada.jpg"
      />,
    );
    fireEvent.error(container.querySelector("img")!);

    rerender(
      <BookCover title="Pós" kind="pos" imageUrl="https://a.com/nova.jpg" />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://a.com/nova.jpg",
    );
  });
});
