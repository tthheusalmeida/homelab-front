import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { BookReading } from "../types";

import { BookOutline } from "./BookOutline";

const chapter = (documentId: string, title: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content: "",
});

const modules: BookReading["modules"] = [
  {
    id: "m1",
    title: "Módulo 1",
    chapters: [chapter("d1", "Docker"), chapter("d2", "Redes")],
  },
  { id: "m2", title: "", chapters: [chapter("d3", "Kubernetes")] },
];

const renderOutline = (
  props: Partial<React.ComponentProps<typeof BookOutline>> = {},
) =>
  render(
    <BookOutline modules={modules} onSelectChapter={() => {}} {...props} />,
  );

describe("BookOutline", () => {
  it("when rendered, should list module titles and numbered chapters", () => {
    renderOutline();

    const nav = screen.getByRole("navigation", { name: "Sumário do livro" });

    expect(within(nav).getByText("Módulo 1")).toBeInTheDocument();
    expect(within(nav).getByText("1. Docker")).toBeInTheDocument();
    expect(within(nav).getByText("2. Redes")).toBeInTheDocument();
    expect(within(nav).getByText("3. Kubernetes")).toBeInTheDocument();
  });

  it("when a module has no title, should not render an empty heading for it", () => {
    renderOutline();

    expect(screen.getAllByText(/^MÓDULO|^Módulo/i)).toHaveLength(1);
  });

  it("when a chapter is clicked, should report its document id", async () => {
    const onSelectChapter = vi.fn();
    const user = userEvent.setup();
    renderOutline({ onSelectChapter });

    await user.click(screen.getByRole("button", { name: "2. Redes" }));

    expect(onSelectChapter).toHaveBeenCalledWith("d2");
  });

  it("when a chapter is the one being read, should highlight only it", () => {
    renderOutline({ activeChapterId: "d2" });

    const active = screen.getByRole("button", { name: "2. Redes" });

    expect(active).toHaveAttribute("aria-current", "location");
    expect(active).toHaveClass("text-primary", "font-semibold");
    expect(
      screen.getByRole("button", { name: "1. Docker" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("when no chapter is active, should highlight none", () => {
    renderOutline();

    expect(document.querySelector("[aria-current]")).not.toBeInTheDocument();
  });
});
