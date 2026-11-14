import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BookFindBar } from "./BookFindBar";

const setup = (
  props: Partial<React.ComponentProps<typeof BookFindBar>> = {},
) => {
  const handlers = {
    onChange: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
  };

  render(
    <BookFindBar value="" count={0} index={-1} {...handlers} {...props} />,
  );

  return { ...handlers, user: userEvent.setup() };
};

const input = () => screen.getByLabelText("Pesquisar no livro");

describe("BookFindBar", () => {
  it("when rendered, should show the field with the Ctrl+K hint", () => {
    setup();

    expect(input()).toHaveAttribute(
      "placeholder",
      "Pesquisar no livro... (Ctrl+K)",
    );
  });

  it("when typing, should report the text", async () => {
    const { onChange, user } = setup();

    await user.type(input(), "d");

    expect(onChange).toHaveBeenCalledWith("d");
  });

  it("when the query is short, should not show the counter or buttons", () => {
    setup({ value: "d" });

    expect(screen.queryByText(/ocorrência|de \d+/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Próxima ocorrência" }),
    ).not.toBeInTheDocument();
  });

  it("when there are matches, should show the current position and the total", () => {
    setup({ value: "docker", count: 12, index: 2 });

    expect(screen.getByText("3 de 12")).toBeInTheDocument();
  });

  it("when nothing matches, should say so and disable the arrows", () => {
    setup({ value: "zzz", count: 0, index: -1 });

    expect(screen.getByText("Nenhuma ocorrência")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Próxima ocorrência" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Ocorrência anterior" }),
    ).toBeDisabled();
  });

  it("when the arrows are clicked, should go to the next or previous occurrence", async () => {
    const { onNext, onPrev, user } = setup({
      value: "docker",
      count: 3,
      index: 0,
    });

    await user.click(
      screen.getByRole("button", { name: "Próxima ocorrência" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Ocorrência anterior" }),
    );

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("when Enter is pressed, should go to the next occurrence; with Shift, to the previous", async () => {
    const { onNext, onPrev, user } = setup({
      value: "docker",
      count: 3,
      index: 0,
    });

    await user.type(input(), "{Enter}");
    await user.type(input(), "{Shift>}{Enter}{/Shift}");

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("when Escape is pressed with text, should clear the search", async () => {
    const { onChange, user } = setup({ value: "docker", count: 1, index: 0 });

    await user.type(input(), "{Escape}");

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("when Escape is pressed with an empty field, should do nothing", async () => {
    const { onChange, user } = setup();

    await user.type(input(), "{Escape}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("when the clear button is clicked, should clear the search", async () => {
    const { onChange, user } = setup({ value: "docker", count: 1, index: 0 });

    await user.click(screen.getByRole("button", { name: "Limpar pesquisa" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("when an input ref is given, should point to the field", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(
      <BookFindBar
        value=""
        count={0}
        index={-1}
        onChange={() => {}}
        onNext={() => {}}
        onPrev={() => {}}
        inputRef={ref}
      />,
    );

    expect(ref.current).toBe(input());
  });
});
