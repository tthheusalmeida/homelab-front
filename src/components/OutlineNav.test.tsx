import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OutlineNav } from "./OutlineNav";

const items = [
  { id: "a", label: "Introdução", level: 1 },
  { id: "b", label: "Detalhes", level: 2 },
  { id: "c", label: "Fim" },
];

const renderNav = (
  props: Partial<React.ComponentProps<typeof OutlineNav>> = {},
) =>
  render(
    <OutlineNav
      items={items}
      ariaLabel="Sumário"
      onSelect={() => {}}
      {...props}
    />,
  );

describe("OutlineNav", () => {
  it("when rendered, should list every item inside a labeled nav", () => {
    renderNav();

    expect(
      screen.getByRole("navigation", { name: "Sumário" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Introdução",
      "Detalhes",
      "Fim",
    ]);
  });

  it("when an item is clicked, should report its id", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderNav({ onSelect });

    await user.click(screen.getByRole("button", { name: "Detalhes" }));

    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("when an item is active, should mark and color only that one", () => {
    renderNav({ activeId: "b" });

    const active = screen.getByRole("button", { name: "Detalhes" });

    expect(active).toHaveAttribute("aria-current", "location");
    expect(active).toHaveClass("text-primary", "font-semibold");
    expect(screen.getByRole("button", { name: "Fim" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("button", { name: "Fim" })).toHaveClass(
      "text-muted-foreground",
    );
  });

  it("when no item is active, should mark none", () => {
    renderNav();

    expect(document.querySelector("[aria-current]")).not.toBeInTheDocument();
  });

  it("when levels differ, should indent deeper ones and treat a missing level as the first", () => {
    renderNav();

    const indent = (name: string) =>
      screen.getByRole("button", { name }).closest("li");

    expect(indent("Introdução")).toHaveStyle({ paddingLeft: "0rem" });
    expect(indent("Detalhes")).toHaveStyle({ paddingLeft: "0.75rem" });
    expect(indent("Fim")).toHaveStyle({ paddingLeft: "0rem" });
  });
});
