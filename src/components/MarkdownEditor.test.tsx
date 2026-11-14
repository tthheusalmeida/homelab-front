import { useState } from "react";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  MarkdownEditor,
  TABLE_TEMPLATE,
  buildImageMarkdown,
} from "./MarkdownEditor";

function Controlled({
  initial = "",
  disabled,
  onChange,
}: {
  initial?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <MarkdownEditor
      value={value}
      disabled={disabled}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const editor = () => screen.getByLabelText("Conteúdo") as HTMLTextAreaElement;

describe("buildImageMarkdown", () => {
  it("when the url is valid, should build the markdown with the alt text", () => {
    expect(buildImageMarkdown("https://x.com/a.png", "Logo")).toBe(
      "![Logo](https://x.com/a.png)",
    );
  });

  it("when the alt text is empty, should keep empty brackets", () => {
    expect(buildImageMarkdown("http://x.com/a.png", "")).toBe(
      "![](http://x.com/a.png)",
    );
  });

  it("when the alt text has brackets or line breaks, should clean them", () => {
    expect(buildImageMarkdown("https://x.com/a.png", "um [teste]\nlinha")).toBe(
      "![um teste linha](https://x.com/a.png)",
    );
  });

  it("when the url has spaces or parentheses, should encode them so the link does not break", () => {
    expect(buildImageMarkdown("https://x.com/a b(1).png", "")).toBe(
      "![](https://x.com/a%20b%281%29.png)",
    );
  });

  it.each(["", "   ", "not a url", "javascript:alert(1)", "ftp://x.com/a.png"])(
    "when the url is %j, should return null",
    (url) => {
      expect(buildImageMarkdown(url, "x")).toBeNull();
    },
  );
});

describe("MarkdownEditor", () => {
  it("when typing, should call onChange with the new text", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Controlled onChange={onChange} />);

    await user.type(editor(), "oi");

    expect(onChange).toHaveBeenLastCalledWith("oi");
  });

  it("when Prévia is clicked, should render the markdown and hide the toolbar", async () => {
    const user = userEvent.setup();
    render(<Controlled initial="# Título grande" />);

    await user.click(screen.getByRole("button", { name: /Prévia/ }));

    expect(
      screen.getByRole("heading", { name: "Título grande" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Conteúdo")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Imagem/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Tabela/ }),
    ).not.toBeInTheDocument();
  });

  it("when the preview is empty, should say there is nothing to show", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.click(screen.getByRole("button", { name: /Prévia/ }));

    expect(screen.getByText("Nada para mostrar ainda.")).toBeInTheDocument();
  });

  describe("table", () => {
    it("when the editor is empty, should insert the table template", async () => {
      const user = userEvent.setup();
      render(<Controlled />);

      await user.click(screen.getByRole("button", { name: /Tabela/ }));

      expect(editor()).toHaveValue(TABLE_TEMPLATE);
    });

    it("when there is text before the cursor, should insert the table in its own block", async () => {
      const user = userEvent.setup();
      render(<Controlled />);
      await user.type(editor(), "Antes");

      await user.click(screen.getByRole("button", { name: /Tabela/ }));

      expect(editor()).toHaveValue(`Antes\n\n${TABLE_TEMPLATE}`);
    });

    it("when the cursor is in the middle of the text, should split it around the table", async () => {
      const user = userEvent.setup();
      render(<Controlled initial="AntesDepois" />);
      editor().setSelectionRange(5, 5);

      await user.click(screen.getByRole("button", { name: /Tabela/ }));

      expect(editor()).toHaveValue(`Antes\n\n${TABLE_TEMPLATE}\n\nDepois`);
    });

    it("when the table is inserted, should put the cursor right after it and focus the editor", async () => {
      const user = userEvent.setup();
      render(<Controlled />);

      await user.click(screen.getByRole("button", { name: /Tabela/ }));

      expect(editor()).toHaveFocus();
      expect(editor().selectionStart).toBe(TABLE_TEMPLATE.length);
    });

    it("when the markdown is previewed, should render the inserted table", async () => {
      const user = userEvent.setup();
      render(<Controlled />);
      await user.click(screen.getByRole("button", { name: /Tabela/ }));

      await user.click(screen.getByRole("button", { name: /Prévia/ }));

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Coluna 1")).toBeInTheDocument();
    });
  });

  describe("image", () => {
    const openPanel = async (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByRole("button", { name: /Imagem/ }));

    it("when Imagem is clicked, should show the url and alt fields", async () => {
      const user = userEvent.setup();
      render(<Controlled />);

      await openPanel(user);

      expect(screen.getByLabelText("URL da imagem")).toBeInTheDocument();
      expect(screen.getByLabelText("Texto alternativo")).toBeInTheDocument();
    });

    it("when a valid url is inserted, should add the image at the cursor and close the panel", async () => {
      const user = userEvent.setup();
      render(<Controlled initial="AntesDepois" />);
      editor().setSelectionRange(5, 5);

      await openPanel(user);
      await user.type(
        screen.getByLabelText("URL da imagem"),
        "https://x.com/a.png",
      );
      await user.type(screen.getByLabelText("Texto alternativo"), "Logo");
      await user.click(screen.getByRole("button", { name: "Inserir imagem" }));

      expect(editor()).toHaveValue("Antes![Logo](https://x.com/a.png)Depois");
      expect(screen.queryByLabelText("URL da imagem")).not.toBeInTheDocument();
      expect(editor()).toHaveFocus();
    });

    it("when the url is invalid, should show an error and not change the text", async () => {
      const user = userEvent.setup();
      render(<Controlled initial="texto" />);

      await openPanel(user);
      await user.type(screen.getByLabelText("URL da imagem"), "isso não é url");
      await user.click(screen.getByRole("button", { name: "Inserir imagem" }));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Informe uma URL http(s) válida.",
      );
      expect(editor()).toHaveValue("texto");
    });

    it("when the user edits the url after an error, should hide the error", async () => {
      const user = userEvent.setup();
      render(<Controlled />);

      await openPanel(user);
      await user.type(screen.getByLabelText("URL da imagem"), "x");
      await user.click(screen.getByRole("button", { name: "Inserir imagem" }));
      await user.type(screen.getByLabelText("URL da imagem"), "y");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("when the image is inserted, should clear the fields for the next one", async () => {
      const user = userEvent.setup();
      render(<Controlled />);

      await openPanel(user);
      await user.type(
        screen.getByLabelText("URL da imagem"),
        "https://x.com/a.png",
      );
      await user.click(screen.getByRole("button", { name: "Inserir imagem" }));
      await openPanel(user);

      expect(screen.getByLabelText("URL da imagem")).toHaveValue("");
    });

    it("when the markdown is previewed, should render the inserted image", async () => {
      const user = userEvent.setup();
      render(<Controlled />);
      await openPanel(user);
      await user.type(
        screen.getByLabelText("URL da imagem"),
        "https://x.com/a.png",
      );
      await user.type(screen.getByLabelText("Texto alternativo"), "Logo");
      await user.click(screen.getByRole("button", { name: "Inserir imagem" }));

      await user.click(screen.getByRole("button", { name: /Prévia/ }));

      expect(screen.getByRole("img", { name: "Logo" })).toHaveAttribute(
        "src",
        "https://x.com/a.png",
      );
    });
  });

  it("when disabled, should disable the editor and the insert buttons", () => {
    render(<Controlled disabled />);

    expect(editor()).toBeDisabled();
    expect(screen.getByRole("button", { name: /Imagem/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Tabela/ })).toBeDisabled();
  });
});

describe("MarkdownEditor — splitPreview", () => {
  it("when splitPreview is on, should show the editor and the preview together without the toggle", () => {
    render(<MarkdownEditor value={"# Olá"} onChange={() => {}} splitPreview />);

    expect(editor()).toBeInTheDocument();
    expect(screen.getByLabelText("Prévia da página")).toHaveTextContent("Olá");
    expect(
      screen.queryByRole("button", { name: "Prévia" }),
    ).not.toBeInTheDocument();
  });

  it("when splitPreview is off, should hide the preview until toggled", () => {
    render(<MarkdownEditor value={"# Olá"} onChange={() => {}} />);

    expect(screen.queryByLabelText("Prévia da página")).not.toBeInTheDocument();
  });
});
