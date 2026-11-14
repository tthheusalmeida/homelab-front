import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { DocumentMeta } from "../types/library.types";

import { DocumentAboutDialog } from "./DocumentAboutDialog";

const meta = (overrides: Partial<DocumentMeta> = {}): DocumentMeta => ({
  id: "id1",
  title: "T",
  type: "summary",
  source: "video",
  sourceUrl: "https://exemplo.com/v.mp4",
  status: "published",
  category: ["A"],
  tags: ["devops", "ci"],
  createdAt: "2026-03-05T10:00:00.000Z",
  updatedAt: "2026-03-06T10:00:00.000Z",
  ...overrides,
});

const renderDialog = (
  props: Partial<React.ComponentProps<typeof DocumentAboutDialog>> = {},
) =>
  render(
    <DocumentAboutDialog
      open
      onOpenChange={() => {}}
      meta={meta()}
      {...props}
    />,
  );

describe("DocumentAboutDialog", () => {
  it("when open, should label each piece of information separately", () => {
    renderDialog();

    for (const label of [
      "Situação",
      "Origem",
      "Tags",
      "Criado em",
      "Atualizado em",
      "Fonte",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    expect(screen.getByText("Na biblioteca")).toBeInTheDocument();
    expect(screen.getByText("Vídeo")).toBeInTheDocument();
  });

  it("when closed, should render nothing", () => {
    renderDialog({ open: false });

    expect(screen.queryByText("Sobre a página")).not.toBeInTheDocument();
  });

  it("when the document has tags, should list each one", () => {
    renderDialog();

    expect(screen.getByText("devops")).toBeInTheDocument();
    expect(screen.getByText("ci")).toBeInTheDocument();
  });

  it("when the document has no tags, should say Sem tags", () => {
    renderDialog({ meta: meta({ tags: [] }) });

    expect(screen.getByText("Sem tags")).toBeInTheDocument();
  });

  it("when the document has a source url, should link to it in a new tab", () => {
    renderDialog();

    const link = screen.getByRole("link", { name: /Fonte original/ });

    expect(link).toHaveAttribute("href", "https://exemplo.com/v.mp4");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("when the document has no source url, should not show the Fonte row", () => {
    renderDialog({ meta: meta({ sourceUrl: undefined }) });

    expect(screen.queryByText("Fonte")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("when the source is manual, should show Manual", () => {
    renderDialog({ meta: meta({ source: "manual" }) });

    expect(screen.getByText("Manual")).toBeInTheDocument();
  });

  it("when edit and remove are given, should call each one on click", async () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onEdit, onRemove });

    await user.click(screen.getByRole("button", { name: /Editar/ }));
    await user.click(
      screen.getByRole("button", { name: /Remover da biblioteca/ }),
    );

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("when onAddToBook is given, should show the button and call it", async () => {
    const onAddToBook = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onAddToBook });

    await user.click(
      screen.getByRole("button", { name: /Adicionar a um livro/ }),
    );

    expect(onAddToBook).toHaveBeenCalledTimes(1);
  });

  it("when onAddToBook is not given, should not show the add to book button", () => {
    renderDialog();

    expect(
      screen.queryByRole("button", { name: /Adicionar a um livro/ }),
    ).not.toBeInTheDocument();
  });

  it("when edit and remove are not given, should not show the action buttons", () => {
    renderDialog();

    expect(
      screen.queryByRole("button", { name: /Editar/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Remover da biblioteca/ }),
    ).not.toBeInTheDocument();
  });
});
