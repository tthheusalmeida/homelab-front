import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BookCompletedDialog } from "./BookCompletedDialog";

const renderDialog = (open = true, onOpenChange = vi.fn()) => {
  render(
    <BookCompletedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Pós em DevOps"
      chapters={12}
      words={8200}
      minutes={41}
    />,
  );

  return onOpenChange;
};

describe("BookCompletedDialog", () => {
  it("when open, should celebrate and name the book", () => {
    renderDialog();

    expect(screen.getByText("Livro concluído!")).toBeInTheDocument();
    expect(
      screen.getByText("Você leu todos os capítulos de “Pós em DevOps”."),
    ).toBeInTheDocument();
  });

  it("when open, should show the chapters, words and reading time", () => {
    renderDialog();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8.200")).toBeInTheDocument();
    expect(screen.getByText("41 min")).toBeInTheDocument();
  });

  it("when open, should rain confetti that screen readers skip", () => {
    renderDialog();

    const pieces = document.querySelectorAll('span[style*="confetti-fall"]');

    expect(pieces.length).toBeGreaterThan(10);
    expect(pieces[0].parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("when Continuar is clicked, should close", async () => {
    const onOpenChange = renderDialog();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Continuar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when closed, should render nothing", () => {
    renderDialog(false);

    expect(screen.queryByText("Livro concluído!")).not.toBeInTheDocument();
  });
});
