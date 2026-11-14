import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { DocumentMeta } from "../types/library.types";

import { DocumentAboutDialog } from "./DocumentAboutDialog";

const meta: DocumentMeta = {
  id: "id1",
  title: "T",
  type: "summary",
  source: "video",
  status: "published",
  category: ["A"],
  tags: [],
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-06T10:00:00.000Z",
};

const renderDialog = () =>
  render(
    <DocumentAboutDialog
      open
      onOpenChange={() => {}}
      meta={meta}
      onEdit={() => {}}
      onRemove={() => {}}
      onAddToBook={() => {}}
    />,
  );

describe("DocumentAboutDialog — footer layout", () => {
  it("when the page has all the actions, should keep every button inside the window", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");
    const footer = dialog.querySelector(
      "[data-slot=dialog-footer]",
    ) as HTMLElement;

    expect(dialog).toContainElement(footer);
    for (const name of [
      /Adicionar a um livro/,
      /Editar/,
      /Remover da biblioteca/,
    ]) {
      expect(footer).toContainElement(screen.getByRole("button", { name }));
    }
  });

  it("when the actions do not fit in one line, should let them wrap instead of overflowing", () => {
    renderDialog();

    const footer = screen
      .getByRole("dialog")
      .querySelector("[data-slot=dialog-footer]");

    expect(footer).toHaveClass("sm:flex-wrap");
  });

  it("when open, should be wide enough for the actions", () => {
    renderDialog();

    expect(screen.getByRole("dialog")).toHaveClass("sm:max-w-lg");
  });
});
