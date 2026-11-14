import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { BookReading } from "../types";

import { BookContent } from "./BookContent";

const chapter = (documentId: string, title: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content: `# ${title}`,
});

const modules: BookReading["modules"] = [
  {
    id: "m1",
    title: "",
    chapters: [chapter("d1", "Docker"), chapter("d2", "Redes")],
  },
];

const renderContent = (
  props: Partial<React.ComponentProps<typeof BookContent>> = {},
) =>
  render(
    <MemoryRouter>
      <BookContent modules={modules} onGoToChapter={() => {}} {...props} />
    </MemoryRouter>,
  );

describe("BookContent — read marks", () => {
  it("when no toggle handler is given, should not show the read buttons", () => {
    renderContent();

    expect(
      screen.queryByRole("button", { name: /Marcar como lido|Lido/ }),
    ).not.toBeInTheDocument();
  });

  it("when a chapter is unread, should offer to mark it as read", () => {
    renderContent({ onToggleRead: () => {} });

    expect(
      screen.getAllByRole("button", { name: /Marcar como lido/ }),
    ).toHaveLength(2);
  });

  it("when a chapter is read, should show it as Lido and pressed", () => {
    renderContent({ readIds: ["d1"], onToggleRead: () => {} });

    const read = screen.getByRole("button", { name: /^Lido$/ });

    expect(read).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getAllByRole("button", { name: /Marcar como lido/ }),
    ).toHaveLength(1);
  });

  it("when Marcar como lido is clicked, should ask to mark that chapter as read", async () => {
    const onToggleRead = vi.fn();
    const user = userEvent.setup();
    renderContent({ onToggleRead });

    await user.click(
      screen.getAllByRole("button", { name: /Marcar como lido/ })[1],
    );

    expect(onToggleRead).toHaveBeenCalledWith("d2", true);
  });

  it("when Lido is clicked, should ask to unmark that chapter", async () => {
    const onToggleRead = vi.fn();
    const user = userEvent.setup();
    renderContent({ readIds: ["d1"], onToggleRead });

    await user.click(screen.getByRole("button", { name: /^Lido$/ }));

    expect(onToggleRead).toHaveBeenCalledWith("d1", false);
  });

  it("when in reading mode, should still allow marking chapters", () => {
    renderContent({ reading: true, onToggleRead: () => {} });

    expect(
      screen.getAllByRole("button", { name: /Marcar como lido/ }),
    ).toHaveLength(2);
  });
});
