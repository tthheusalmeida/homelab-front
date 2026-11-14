import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BookCover } from "./BookCover";

describe("BookCover — completed", () => {
  it("when the book is completed, should get a golden frame and the Concluído ribbon", () => {
    render(<BookCover title="Pós" kind="pos" completed />);

    const cover = screen.getByRole("img", { name: "Capa do livro Pós" });

    expect(cover).toHaveClass("ring-amber-400");
    expect(cover).toHaveTextContent("Concluído");
  });

  it("when the book is not completed, should have no frame or ribbon", () => {
    render(<BookCover title="Pós" kind="pos" />);

    const cover = screen.getByRole("img", { name: "Capa do livro Pós" });

    expect(cover).not.toHaveClass("ring-amber-400");
    expect(cover).not.toHaveTextContent("Concluído");
  });
});
