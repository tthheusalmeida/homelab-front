import { useState } from "react";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryPicker, type CategoryOption } from "./CategoryPicker";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { OptionSelect } from "./OptionSelect";
import { SearchInput } from "./SearchInput";
import { TagInput } from "./TagInput";

function Controlled({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (tags: string[]) => void;
}) {
  const [tags, setTags] = useState(initial);

  return (
    <TagInput
      value={tags}
      onChange={(next) => {
        setTags(next);
        onChange?.(next);
      }}
    />
  );
}

describe("TagInput", () => {
  const box = () => screen.getByLabelText("Adicionar tag");

  it("when Enter is pressed, should add the typed tag lowercased and clear the field", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.type(box(), "DevOps{Enter}");

    expect(screen.getByText("devops")).toBeInTheDocument();
    expect(box()).toHaveValue("");
  });

  it("when a comma is typed, should add the tag", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.type(box(), "ci,");

    expect(screen.getByText("ci")).toBeInTheDocument();
  });

  it("when the tag already exists ignoring case or accent, should not duplicate it", async () => {
    const user = userEvent.setup();
    render(<Controlled initial={["química"]} />);

    await user.type(box(), "QUIMICA{Enter}");

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("when the draft is blank, should not add a tag", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await user.type(box(), "   {Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("when the field loses focus with text, should add the tag", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.type(box(), "redes");
    await user.tab();

    expect(screen.getByText("redes")).toBeInTheDocument();
  });

  it("when Backspace is pressed on an empty field, should remove the last tag", async () => {
    const user = userEvent.setup();
    render(<Controlled initial={["a", "b"]} />);

    await user.type(box(), "{Backspace}");

    expect(screen.queryByText("b")).not.toBeInTheDocument();
    expect(screen.getByText("a")).toBeInTheDocument();
  });

  it("when the remove button of a tag is clicked, should remove only that tag", async () => {
    const user = userEvent.setup();
    render(<Controlled initial={["a", "b"]} />);

    await user.click(screen.getByRole("button", { name: "Remover tag a" }));

    expect(screen.queryByText("a")).not.toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("when disabled, should not accept typing or removal", () => {
    render(<TagInput value={["a"]} onChange={() => {}} disabled />);

    expect(box()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remover tag a" })).toBeDisabled();
  });
});

const tree: CategoryOption[] = [
  {
    name: "Ciência da Computação",
    children: [{ name: "DevOps", children: [] }, { name: "Redes", children: [] }],
  },
  { name: "Química", children: [] },
];

function ControlledPicker({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (value: string[]) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <CategoryPicker
      value={value}
      options={tree}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const optionValues = (input: HTMLElement) =>
  Array.from(
    document.querySelectorAll(`#${input.getAttribute("list")} option`),
  ).map((option) => option.getAttribute("value"));

describe("CategoryPicker", () => {
  it("when empty, should show only the first level", () => {
    render(<ControlledPicker />);

    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.queryByLabelText("Subcategoria")).not.toBeInTheDocument();
  });

  it("when the first level has existing categories, should suggest them", () => {
    render(<ControlledPicker />);

    expect(optionValues(screen.getByLabelText("Categoria"))).toEqual([
      "Ciência da Computação",
      "Química",
    ]);
  });

  it("when a level is filled, should reveal the next one with the children as suggestions", async () => {
    const user = userEvent.setup();
    render(<ControlledPicker />);

    await user.type(screen.getByLabelText("Categoria"), "ciencia da computacao");

    const next = screen.getByLabelText("Subcategoria");
    expect(optionValues(next)).toEqual(["DevOps", "Redes"]);
  });

  it("when levels are filled, should call onChange with the whole path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledPicker onChange={onChange} />);

    await user.type(screen.getByLabelText("Categoria"), "A");
    await user.type(screen.getByLabelText("Subcategoria"), "B");

    expect(onChange).toHaveBeenLastCalledWith(["A", "B"]);
  });

  it("when a level is cleared, should clear the deeper levels", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledPicker initial={["A", "B", "C"]} onChange={onChange} />);

    await user.clear(screen.getByLabelText("Categoria"));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByLabelText("Subcategoria")).not.toBeInTheDocument();
  });

  it("when four levels are filled, should not show a fifth", () => {
    render(<ControlledPicker initial={["A", "B", "C", "D"]} />);

    expect(screen.getByLabelText("Subcategoria 3")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(4);
  });

  it("when the typed name does not exist at that level, should mark it as a new category", async () => {
    const user = userEvent.setup();
    render(<ControlledPicker />);

    await user.type(screen.getByLabelText("Categoria"), "Matemática");

    expect(screen.getByText("Nova categoria")).toBeInTheDocument();
  });

  it("when the typed name exists ignoring case and accent, should not mark it as new", async () => {
    const user = userEvent.setup();
    render(<ControlledPicker />);

    await user.type(screen.getByLabelText("Categoria"), "quimica");

    expect(screen.queryByText("Nova categoria")).not.toBeInTheDocument();
  });

  it("when levels are filled, should show the resulting path", () => {
    render(<ControlledPicker initial={["Ciência", "Química"]} />);

    expect(screen.getByText("Ciência › Química")).toBeInTheDocument();
  });

  it("when nothing is filled, should not show the resulting path", () => {
    render(<ControlledPicker />);

    expect(screen.queryByText(/Ficará em/)).not.toBeInTheDocument();
  });

  it("when disabled, should disable every level", () => {
    render(
      <CategoryPicker value={["A"]} options={tree} onChange={() => {}} disabled />,
    );

    for (const input of screen.getAllByRole("combobox")) {
      expect(input).toBeDisabled();
    }
  });
});

describe("SearchInput", () => {
  it("when typing, should call onChange with the text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Buscar" />);

    await user.type(screen.getByLabelText("Buscar"), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("when given a value, should show it", () => {
    render(<SearchInput value="devops" onChange={() => {}} />);

    expect(screen.getByRole("searchbox")).toHaveValue("devops");
  });
});

describe("EmptyState", () => {
  it("when given title, description and action, should render all of them", () => {
    render(
      <EmptyState
        title="Vazio"
        description="Nada aqui"
        action={<button>Fazer</button>}
      />,
    );

    expect(screen.getByText("Vazio")).toBeInTheDocument();
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fazer" })).toBeInTheDocument();
  });

  it("when only the title is given, should not render description or action", () => {
    render(<EmptyState title="Vazio" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("ConfirmDialog", () => {
  const setup = (props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Apagar?"
        description="Não dá para desfazer."
        confirmLabel="Apagar"
        onConfirm={onConfirm}
        {...props}
      />,
    );
    return { onConfirm, onOpenChange, user: userEvent.setup() };
  };

  it("when open, should show title and description", () => {
    setup();

    expect(screen.getByText("Apagar?")).toBeInTheDocument();
    expect(screen.getByText("Não dá para desfazer.")).toBeInTheDocument();
  });

  it("when errorMessage is given, should show it as an alert", () => {
    setup({ errorMessage: "Falhou ao apagar." });

    expect(screen.getByRole("alert")).toHaveTextContent("Falhou ao apagar.");
  });

  it("when there is no errorMessage, should not show an alert", () => {
    setup();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("when confirm is clicked, should call onConfirm", async () => {
    const { onConfirm, user } = setup();

    await user.click(screen.getByRole("button", { name: "Apagar" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("when cancel is clicked, should close without confirming", async () => {
    const { onConfirm, onOpenChange, user } = setup();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("when pending, should disable both buttons", () => {
    setup({ isPending: true });

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Apagar" })).toBeDisabled();
  });

  it("when closed, should render nothing", () => {
    setup({ open: false });

    expect(screen.queryByText("Apagar?")).not.toBeInTheDocument();
  });
});

describe("OptionSelect", () => {
  it("when a value is selected, should show its label", () => {
    render(
      <OptionSelect
        value="b"
        placeholder="Escolha"
        options={[
          { id: "a", label: "Opção A" },
          { id: "b", label: "Opção B" },
        ]}
        onValueChange={() => {}}
      />,
    );

    expect(screen.getByText("Opção B")).toBeInTheDocument();
  });

  it("when there is no value, should show the placeholder", () => {
    render(
      <OptionSelect
        placeholder="Escolha"
        options={[{ id: "a", label: "Opção A" }]}
        onValueChange={() => {}}
      />,
    );

    expect(screen.getByText("Escolha")).toBeInTheDocument();
  });

  it("when disabled, should disable the trigger", () => {
    render(
      <OptionSelect
        placeholder="Escolha"
        options={[]}
        disabled
        onValueChange={() => {}}
      />,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
