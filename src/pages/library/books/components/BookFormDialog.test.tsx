import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const create = { mutate: vi.fn(), isPending: false, isError: false };
const update = { mutate: vi.fn(), isPending: false, isError: false };

vi.mock("../hooks", () => ({
  useCreateBook: () => create,
  useUpdateBook: () => update,
}));

import { BookFormDialog } from "./BookFormDialog";

const existing = {
  id: "b1",
  title: "Pós",
  kind: "pos" as const,
  description: "Aulas",
  subtitle: "Sub",
  coverColor: "rose" as const,
  coverImageUrl: "",
};

describe("BookFormDialog", () => {
  beforeEach(() => {
    create.mutate.mockReset();
    update.mutate.mockReset();
    create.isError = false;
    update.isError = false;
    create.isPending = false;
  });

  it("when creating, should start empty with Salvar disabled", () => {
    render(<BookFormDialog open onOpenChange={() => {}} />);

    expect(screen.getByText("Novo livro")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Criar livro" })).toBeDisabled();
  });

  it("when creating and submitted, should send trimmed title, default kind and description", async () => {
    const user = userEvent.setup();
    render(<BookFormDialog open onOpenChange={() => {}} />);

    await user.type(screen.getByLabelText("Título"), "  Meu livro ");
    await user.type(screen.getByLabelText(/Descrição/), "Notas");
    await user.click(screen.getByRole("button", { name: "Criar livro" }));

    expect(create.mutate).toHaveBeenCalledWith(
      {
        title: "Meu livro",
        kind: "study",
        description: "Notas",
        subtitle: "",
        coverColor: "blue",
        coverImageUrl: "",
      },
      expect.any(Object),
    );
  });

  it("when the book is saved, should report it and close", async () => {
    create.mutate.mockImplementation(
      (_input: unknown, options: { onSuccess: (b: unknown) => void }) =>
        options.onSuccess({ id: "b9" }),
    );
    const onSaved = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <BookFormDialog open onOpenChange={onOpenChange} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText("Título"), "X");
    await user.click(screen.getByRole("button", { name: "Criar livro" }));

    expect(onSaved).toHaveBeenCalledWith({ id: "b9" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when editing, should fill the fields and update instead of creating", async () => {
    const user = userEvent.setup();
    render(<BookFormDialog open onOpenChange={() => {}} book={existing} />);

    expect(screen.getByText("Editar livro")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Pós");

    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Pós 2");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(update.mutate).toHaveBeenCalledWith(
      {
        id: "b1",
        input: {
          title: "Pós 2",
          kind: "pos",
          description: "Aulas",
          subtitle: "Sub",
          coverColor: "rose",
          coverImageUrl: "",
        },
      },
      expect.any(Object),
    );
    expect(create.mutate).not.toHaveBeenCalled();
  });

  describe("cover", () => {
    it("when open, should show a live preview of the cover with the typed title and subtitle", async () => {
      const user = userEvent.setup();
      render(<BookFormDialog open onOpenChange={() => {}} />);

      expect(
        screen.getByRole("img", { name: "Capa do livro Título do livro" }),
      ).toBeInTheDocument();

      await user.type(screen.getByLabelText("Título"), "Pós");
      await user.type(screen.getByLabelText(/Subtítulo/), "Aulas");

      expect(
        screen.getByRole("img", { name: "Capa do livro Pós" }),
      ).toHaveTextContent("Aulas");
    });

    it("when a color is chosen, should mark it and send it", async () => {
      const user = userEvent.setup();
      render(<BookFormDialog open onOpenChange={() => {}} />);

      expect(screen.getByRole("button", { name: "Azul" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      await user.click(screen.getByRole("button", { name: "Verde" }));
      await user.type(screen.getByLabelText("Título"), "X");
      await user.click(screen.getByRole("button", { name: "Criar livro" }));

      expect(screen.getByRole("img", { name: "Capa do livro X" })).toHaveClass(
        "from-emerald-600",
      );
      expect(create.mutate).toHaveBeenCalledWith(
        expect.objectContaining({ coverColor: "emerald" }),
        expect.any(Object),
      );
    });

    it("when an image url is typed, should send it trimmed", async () => {
      const user = userEvent.setup();
      render(<BookFormDialog open onOpenChange={() => {}} />);

      await user.type(screen.getByLabelText("Título"), "X");
      await user.type(
        screen.getByLabelText(/Imagem da capa/),
        " https://a.com/capa.jpg ",
      );
      await user.click(screen.getByRole("button", { name: "Criar livro" }));

      expect(create.mutate).toHaveBeenCalledWith(
        expect.objectContaining({ coverImageUrl: "https://a.com/capa.jpg" }),
        expect.any(Object),
      );
    });

    it("when the image url is not http(s), should show the error and block saving", async () => {
      const user = userEvent.setup();
      render(<BookFormDialog open onOpenChange={() => {}} />);

      await user.type(screen.getByLabelText("Título"), "X");
      await user.type(screen.getByLabelText(/Imagem da capa/), "ftp://a.com/x");

      expect(
        screen.getByText("Informe uma URL http(s) válida."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Criar livro" }),
      ).toBeDisabled();
    });

    it("when editing, should start with the saved color, subtitle and image", () => {
      render(
        <BookFormDialog
          open
          onOpenChange={() => {}}
          book={{ ...existing, coverImageUrl: "https://a.com/c.jpg" }}
        />,
      );

      expect(screen.getByLabelText(/Subtítulo/)).toHaveValue("Sub");
      expect(screen.getByRole("button", { name: "Rosa" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByLabelText(/Imagem da capa/)).toHaveValue(
        "https://a.com/c.jpg",
      );
    });
  });

  it("when saving fails, should show an error", () => {
    create.isError = true;
    render(<BookFormDialog open onOpenChange={() => {}} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /Não foi possível salvar o livro/,
    );
  });

  it("when Cancelar is clicked, should close without saving", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<BookFormDialog open onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(create.mutate).not.toHaveBeenCalled();
  });

  it("when closed, should render nothing", () => {
    render(<BookFormDialog open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText("Novo livro")).not.toBeInTheDocument();
  });
});
