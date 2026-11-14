import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const update = { mutate: vi.fn(), isPending: false, isError: false };

vi.mock("../hooks/useLibrary", () => ({
  useCategories: () => ({ data: [] }),
  useUpdateDocument: () => update,
}));

import type { DocumentDetail } from "../types/library.types";

import { EditDocumentDialog } from "./EditDocumentDialog";

const original: DocumentDetail = {
  meta: {
    id: "id1",
    title: "Práticas",
    type: "summary",
    source: "video",
    status: "published",
    category: ["Ciência"],
    tags: [],
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-06T10:00:00.000Z",
  },
  content: "# Introdução",
};

describe("EditDocumentDialog", () => {
  beforeEach(() => {
    update.mutate.mockReset();
  });

  it("when open, should show the form filled with the document", () => {
    render(
      <EditDocumentDialog open onOpenChange={() => {}} document={original} />,
    );

    expect(screen.getByText("Editar página")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Práticas")).toBeInTheDocument();
    expect(screen.getByLabelText("Prévia da página")).toBeInTheDocument();
  });

  it("when open, should take the whole screen", () => {
    render(
      <EditDocumentDialog open onOpenChange={() => {}} document={original} />,
    );

    expect(screen.getByRole("dialog")).toHaveClass("h-dvh", "w-screen");
  });

  it("when closed, should render nothing", () => {
    render(
      <EditDocumentDialog
        open={false}
        onOpenChange={() => {}}
        document={original}
      />,
    );

    expect(screen.queryByText("Editar página")).not.toBeInTheDocument();
  });

  it("when Cancelar is clicked, should ask to close", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditDocumentDialog
        open
        onOpenChange={onOpenChange}
        document={original}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when the save succeeds, should ask to close", async () => {
    update.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: () => void }) =>
        options.onSuccess(),
    );
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditDocumentDialog
        open
        onOpenChange={onOpenChange}
        document={original}
      />,
    );

    await user.type(screen.getByDisplayValue("Práticas"), " 2");
    await user.click(screen.getByRole("button", { name: /Salvar alterações/ }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
