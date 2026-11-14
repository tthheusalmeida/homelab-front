import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

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
    title: "",
    chapters: [chapter("d1", "Docker"), chapter("d2", "Redes")],
  },
];

describe("BookOutline — read chapters", () => {
  it("when a chapter is read, should show a check and announce it", () => {
    render(
      <BookOutline
        modules={modules}
        readIds={["d1"]}
        onSelectChapter={() => {}}
      />,
    );

    const read = screen.getByRole("button", { name: "1. Docker, lido" });

    expect(read.querySelector("svg")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2. Redes" }).querySelector("svg"),
    ).not.toBeInTheDocument();
  });

  it("when no chapter is read, should show no check", () => {
    render(<BookOutline modules={modules} onSelectChapter={() => {}} />);

    expect(document.querySelector("svg")).not.toBeInTheDocument();
  });
});

describe("BookOutline — aligned read marks", () => {
  it("when chapters are listed, should reserve the same mark column in every row, read or not", () => {
    render(
      <BookOutline
        modules={modules}
        readIds={["d1"]}
        onSelectChapter={() => {}}
      />,
    );

    const slots = document.querySelectorAll("[data-slot=read-mark]");

    expect(slots).toHaveLength(2);
    for (const slot of slots) {
      expect(slot).toHaveClass("size-4", "shrink-0");
    }
  });

  it("when a chapter is read, should put the check in the mark column and not beside the title text", () => {
    render(
      <BookOutline
        modules={modules}
        readIds={["d1"]}
        onSelectChapter={() => {}}
      />,
    );

    const button = screen.getByRole("button", { name: "1. Docker, lido" });
    const [title, mark] = [...button.children];

    expect(title).toHaveTextContent("1. Docker");
    expect(title.querySelector("svg")).toBeNull();
    expect(mark).toHaveAttribute("data-slot", "read-mark");
    expect(mark.querySelector("svg")).toBeInTheDocument();
  });

  it("when a chapter is unread, should leave its mark column empty", () => {
    render(
      <BookOutline
        modules={modules}
        readIds={["d1"]}
        onSelectChapter={() => {}}
      />,
    );

    const unread = screen.getByRole("button", { name: "2. Redes" });

    expect(unread.querySelector("[data-slot=read-mark]")).toBeEmptyDOMElement();
  });

  it("when the title is long, should let it wrap in its own column", () => {
    render(<BookOutline modules={modules} onSelectChapter={() => {}} />);

    expect(
      screen.getByRole("button", { name: "1. Docker" }).firstElementChild,
    ).toHaveClass("min-w-0", "flex-1");
  });
});
