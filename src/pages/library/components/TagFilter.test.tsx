import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TagFilter } from "./TagFilter";

const many = Array.from({ length: 12 }, (_, index) => ({
  tag: `tag${String(index).padStart(2, "0")}`,
  count: 12 - index,
}));

const setup = (selected: string[] = [], tags = many) => {
  const onToggle = vi.fn();
  render(<TagFilter tags={tags} selected={selected} onToggle={onToggle} />);

  return { onToggle, user: userEvent.setup() };
};

describe("TagFilter", () => {
  it("when there are few tags, should show all with counts and no overflow button", () => {
    setup([], many.slice(0, 3));

    expect(
      screen.getByRole("button", { name: "tag00 · 12" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tags$/ }),
    ).not.toBeInTheDocument();
  });

  it("when there are many tags, should show the 8 most used and a +N tags button", () => {
    setup();

    expect(screen.getByRole("button", { name: /tag07/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tag08/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+4 tags" })).toBeInTheDocument();
  });

  it("when a hidden tag is selected, should keep it visible in the bar", () => {
    setup(["tag11"]);

    expect(screen.getByRole("button", { name: /tag11/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "+3 tags" })).toBeInTheDocument();
  });

  it("when the list is unsorted, should order by count then name", () => {
    setup(
      [],
      [
        { tag: "b", count: 1 },
        { tag: "a", count: 1 },
        { tag: "c", count: 5 },
      ],
    );

    const names = screen.getAllByRole("button").map((b) => b.textContent);

    expect(names).toEqual(["c · 5", "a · 1", "b · 1"]);
  });

  it("when a tag is clicked, should call onToggle with it", async () => {
    const { onToggle, user } = setup();

    await user.click(screen.getByRole("button", { name: /tag01/ }));

    expect(onToggle).toHaveBeenCalledWith("tag01");
  });

  it("when +N tags is clicked, should open a window with every tag", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "+4 tags" }));

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Todas as tags")).toBeInTheDocument();
    expect(
      within(dialog).getAllByRole("button", { name: /tag\d\d/ }),
    ).toHaveLength(12);
  });

  it("when searching in the window, should filter ignoring accents and case", async () => {
    const { user } = setup([], [...many, { tag: "Ciência", count: 1 }]);
    await user.click(screen.getByRole("button", { name: /tags$/ }));

    await user.type(screen.getByPlaceholderText("Buscar tag..."), "CIENCIA");

    const dialog = screen.getByRole("dialog");

    expect(
      within(dialog).getByRole("button", { name: /Ciência/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: /tag00/ }),
    ).not.toBeInTheDocument();
  });

  it("when nothing matches the search, should say so", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "+4 tags" }));

    await user.type(screen.getByPlaceholderText("Buscar tag..."), "zzz");

    expect(screen.getByText("Nenhuma tag encontrada.")).toBeInTheDocument();
  });

  it("when a tag is chosen in the window, should call onToggle", async () => {
    const { onToggle, user } = setup();
    await user.click(screen.getByRole("button", { name: "+4 tags" }));

    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: /tag11/ }),
    );

    expect(onToggle).toHaveBeenCalledWith("tag11");
  });
});
