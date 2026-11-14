import { useState } from "react";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DocumentFields } from "./DocumentFields";

function Controlled({
  disabled,
  placeholder,
  onChange,
}: {
  disabled?: boolean;
  placeholder?: string;
  onChange?: (state: {
    title: string;
    category: string[];
    tags: string[];
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  onChange?.({ title, category, tags });

  return (
    <DocumentFields
      idPrefix="x"
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder={placeholder}
      category={category}
      onCategoryChange={setCategory}
      categoryOptions={[{ name: "Química", children: [] }]}
      tags={tags}
      onTagsChange={setTags}
      disabled={disabled}
    />
  );
}

describe("DocumentFields", () => {
  it("when rendered, should show title, category, tags and the explanation texts", () => {
    render(<Controlled />);

    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Adicionar tag")).toBeInTheDocument();
    expect(screen.getByText("pasta")).toBeInTheDocument();
    expect(screen.getByText(/Etiquetas livres/)).toBeInTheDocument();
  });

  it("when the user types, should report title, category and tags", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Controlled onChange={onChange} />);

    await user.type(screen.getByLabelText("Título"), "T");
    await user.type(screen.getByLabelText("Categoria"), "Química");
    await user.type(screen.getByLabelText("Adicionar tag"), "ligacao{Enter}");

    expect(onChange).toHaveBeenLastCalledWith({
      title: "T",
      category: ["Química"],
      tags: ["ligacao"],
    });
  });

  it("when a placeholder is given, should show it in the title field", () => {
    render(<Controlled placeholder="Se vazio: Padrão" />);

    expect(screen.getByLabelText("Título")).toHaveAttribute(
      "placeholder",
      "Se vazio: Padrão",
    );
  });

  it("when disabled, should disable every field", () => {
    render(<Controlled disabled />);

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(screen.getByLabelText("Categoria")).toBeDisabled();
    expect(screen.getByLabelText("Adicionar tag")).toBeDisabled();
  });
});
