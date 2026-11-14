import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ReadingSection } from "./ReadingSection";

describe("ReadingSection", () => {
  it("when rendered, should show the centered title as a level 1 heading and the text under it", () => {
    render(
      <ReadingSection title="Docker">
        <p>texto</p>
      </ReadingSection>,
    );

    const heading = screen.getByRole("heading", { name: "Docker", level: 1 });

    expect(heading.parentElement).toHaveClass("text-center");
    expect(screen.getByText("texto")).toBeInTheDocument();
  });

  it("when a chapter level is requested, should render the title as a level 2 heading", () => {
    render(
      <ReadingSection title="Docker" headingLevel={2}>
        <p>texto</p>
      </ReadingSection>,
    );

    expect(
      screen.getByRole("heading", { name: "Docker", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("when a label is given, should show it above the title", () => {
    render(
      <ReadingSection title="Docker" label="Capítulo 2">
        <p>texto</p>
      </ReadingSection>,
    );

    const label = screen.getByText("Capítulo 2");
    const heading = screen.getByRole("heading", { name: "Docker" });

    expect(
      label.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("when no label is given, should not render an empty label line", () => {
    render(
      <ReadingSection title="Docker">
        <p>texto</p>
      </ReadingSection>,
    );

    expect(
      screen.getByRole("region", { name: "Docker" }).querySelector("header p"),
    ).toBeNull();
  });

  it("when an id is given, should put it on the section so the summary can scroll to it", () => {
    render(
      <ReadingSection id="chapter-d1" title="Docker">
        <p>texto</p>
      </ReadingSection>,
    );

    expect(screen.getByRole("region", { name: "Docker" })).toHaveAttribute(
      "id",
      "chapter-d1",
    );
  });

  it("when a footer is given, should show it centered under the text", () => {
    render(
      <ReadingSection title="Docker" footer={<button>Marcar</button>}>
        <p>texto</p>
      </ReadingSection>,
    );

    const footer = screen.getByRole("button", { name: "Marcar" }).parentElement;

    expect(footer?.tagName).toBe("FOOTER");
    expect(footer).toHaveClass("justify-center");
  });

  it("when no footer is given, should not render one", () => {
    render(
      <ReadingSection title="Docker">
        <p>texto</p>
      </ReadingSection>,
    );

    expect(
      screen.getByRole("region", { name: "Docker" }).querySelector("footer"),
    ).toBeNull();
  });

  it("when rendered, should have no frame, so it sits on the platform background", () => {
    render(
      <ReadingSection title="Docker">
        <p>texto</p>
      </ReadingSection>,
    );

    const section = screen.getByRole("region", { name: "Docker" });

    expect(section.className).not.toMatch(/border|bg-|shadow|rounded/);
  });

  it("when a page and a chapter are rendered, should use the same title style", () => {
    const { rerender } = render(
      <ReadingSection title="Página">
        <p>x</p>
      </ReadingSection>,
    );
    const page = screen.getByRole("heading", { name: "Página" }).className;

    rerender(
      <ReadingSection title="Capítulo" headingLevel={2}>
        <p>x</p>
      </ReadingSection>,
    );

    expect(screen.getByRole("heading", { name: "Capítulo" }).className).toBe(
      page,
    );
  });
});
