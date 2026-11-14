import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ViewToggle } from "./ViewToggle";

describe("ViewToggle", () => {
  it("when rendered, should mark only the current mode as pressed", () => {
    render(<ViewToggle value="card" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Cartões" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Lista" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Grade" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it.each([
    ["Lista", "list"],
    ["Cartões", "card"],
    ["Grade", "grid"],
  ])("when %s is clicked, should call onChange with %s", async (name, mode) => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle value="list" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name }));

    expect(onChange).toHaveBeenCalledWith(mode);
  });
});
