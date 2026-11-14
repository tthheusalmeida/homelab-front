import { StrictMode } from "react";
import { extractHeadings } from "#lib/markdown";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { MarkdownMessage } from "./MarkdownMessage";

describe("MarkdownMessage — heading ids", () => {
  it("when headingIds is not set, should render headings without id", () => {
    render(<MarkdownMessage content="## Título" />);

    expect(screen.getByRole("heading", { name: "Título" })).not.toHaveAttribute(
      "id",
    );
  });

  it("when headingIds is set, should give each heading a slug id", () => {
    render(
      <MarkdownMessage
        content={"# Ligações Químicas\n\n## Passo 1"}
        headingIds
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Ligações Químicas" }),
    ).toHaveAttribute("id", "ligacoes-quimicas");
    expect(screen.getByRole("heading", { name: "Passo 1" })).toHaveAttribute(
      "id",
      "passo-1",
    );
  });

  it("when titles repeat, should number the ids in document order", () => {
    render(<MarkdownMessage content={"## Passo\n\n## Passo"} headingIds />);

    const [first, second] = screen.getAllByRole("heading", { name: "Passo" });

    expect(first).toHaveAttribute("id", "passo");
    expect(second).toHaveAttribute("id", "passo-2");
  });

  it("when a heading has inline formatting, should build the id from its text", () => {
    render(<MarkdownMessage content="## **Negrito** e `código`" headingIds />);

    expect(screen.getByRole("heading")).toHaveAttribute(
      "id",
      "negrito-e-codigo",
    );
  });

  it("when rendered again, should restart the numbering", () => {
    const { rerender } = render(
      <MarkdownMessage content={"## A\n\n## A"} headingIds />,
    );

    rerender(<MarkdownMessage content={"## A\n\n## A"} headingIds />);

    const [first, second] = screen.getAllByRole("heading", { name: "A" });

    expect(first).toHaveAttribute("id", "a");
    expect(second).toHaveAttribute("id", "a-2");
  });
});

describe("MarkdownMessage — heading ids and the summary", () => {
  it("when rendered in StrictMode, should give the same ids the summary lists", () => {
    const markdown = "# Intro\n\n## Passo\n\ntexto\n\n## Passo\n\n### Fim";

    render(
      <StrictMode>
        <MarkdownMessage content={markdown} headingIds />
      </StrictMode>,
    );

    const rendered = screen.getAllByRole("heading").map((node) => node.id);

    expect(rendered).toEqual(extractHeadings(markdown).map(({ id }) => id));
  });
});

describe("MarkdownMessage — idPrefix", () => {
  it("when idPrefix is set, should prefix every heading id", () => {
    render(
      <MarkdownMessage
        content={"# Docker\n\n## Imagens"}
        headingIds
        idPrefix="d1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Docker" })).toHaveAttribute(
      "id",
      "d1-docker",
    );
    expect(screen.getByRole("heading", { name: "Imagens" })).toHaveAttribute(
      "id",
      "d1-imagens",
    );
  });

  it("when two texts use different prefixes, should not repeat ids", () => {
    render(
      <>
        <MarkdownMessage content="# Intro" headingIds idPrefix="a" />
        <MarkdownMessage content="# Intro" headingIds idPrefix="b" />
      </>,
    );

    expect(screen.getAllByRole("heading").map((h) => h.id)).toEqual([
      "a-intro",
      "b-intro",
    ]);
  });
});

describe("MarkdownMessage — size", () => {
  it("when size is not given, should use the small prose", () => {
    render(<MarkdownMessage content="# T" />);

    expect(screen.getByRole("heading").closest(".prose")).toHaveClass(
      "prose-sm",
    );
  });

  it("when size is base, should use the base prose and not the small one", () => {
    render(<MarkdownMessage content="# T" size="base" className="extra" />);

    const text = screen.getByRole("heading").closest(".prose");

    expect(text).toHaveClass("prose-base", "extra");
    expect(text).not.toHaveClass("prose-sm");
  });
});
