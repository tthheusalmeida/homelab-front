import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { BookReading } from "../types";

import { BookContent } from "./BookContent";

const chapter = (documentId: string, title: string, content: string) => ({
  documentId,
  title,
  category: [],
  available: true,
  content,
});

const modules: BookReading["modules"] = [
  {
    id: "m1",
    title: "Módulo 1",
    chapters: [
      chapter("d1", "Docker", "# Docker\n\n## Imagens\n\ntexto"),
      chapter("d2", "Redes", "# Redes\n\nconteúdo"),
    ],
  },
  { id: "m2", title: "", chapters: [chapter("d3", "Kubernetes", "# K8s")] },
];

const renderReading = (
  props: Partial<React.ComponentProps<typeof BookContent>> = {},
) =>
  render(
    <MemoryRouter>
      <BookContent
        reading
        modules={modules}
        onGoToChapter={() => {}}
        {...props}
      />
    </MemoryRouter>,
  );

const section = (title: string) => screen.getByRole("region", { name: title });

describe("BookContent — reading mode look", () => {
  it("when reading, should not draw the chapter cards (no frame, no header and footer bands)", () => {
    renderReading();

    for (const title of ["Docker", "Redes", "Kubernetes"]) {
      const element = section(title);

      expect(element.className).not.toMatch(
        /border-2|bg-card|shadow|rounded-xl/,
      );
      expect(element.querySelector("[data-slot=paper-page]")).toBeNull();
    }
  });

  it("when reading, should use the same section as the page: centered title and text on the platform background", () => {
    renderReading();

    const heading = within(section("Docker")).getByRole("heading", {
      name: "Docker",
      level: 2,
    });

    expect(heading.parentElement).toHaveClass("text-center");
    expect(heading).toHaveClass("text-3xl", "font-semibold");
  });

  it("when reading, should label each chapter with its number", () => {
    renderReading();

    expect(
      within(section("Docker")).getByText("Capítulo 1"),
    ).toBeInTheDocument();
    expect(
      within(section("Redes")).getByText("Capítulo 2"),
    ).toBeInTheDocument();
    expect(
      within(section("Kubernetes")).getByText("Capítulo 3"),
    ).toBeInTheDocument();
  });

  it("when reading, should keep the chapter anchor so the summary can scroll to it", () => {
    renderReading();

    expect(section("Redes")).toHaveAttribute("id", "chapter-d2");
  });

  it("when reading, should render the text in the base size with the heading ids prefixed by the chapter", () => {
    const { container } = renderReading();

    expect(container.querySelector(".prose")).toHaveClass("prose-base");
    expect(screen.getByRole("heading", { name: "Imagens" })).toHaveAttribute(
      "id",
      "d1-imagens",
    );
  });

  describe("separators", () => {
    it("when a module has a title, should show it as a subtle divider between two lines, not as a banner", () => {
      renderReading();

      const title = screen.getByRole("heading", { name: "Módulo 1", level: 2 });

      expect(title).toHaveClass(
        "text-xs",
        "uppercase",
        "text-muted-foreground",
      );
      expect(title.parentElement?.children).toHaveLength(3);
      expect(title.parentElement?.className).not.toMatch(
        /bg-primary|rounded-xl/,
      );
    });

    it("when a module has no title, should not draw a divider for it", () => {
      renderReading();

      expect(
        screen.getAllByRole("heading", { level: 2, name: /Módulo/ }),
      ).toHaveLength(1);
    });

    it("when chapters follow each other, should separate them with a subtle line", () => {
      renderReading();

      expect(section("Redes").parentElement).toHaveClass(
        "border-t",
        "border-border/60",
      );
      expect(section("Kubernetes").parentElement).toHaveClass("border-t");
    });

    it("when a chapter is the very first, should not have a line above it", () => {
      renderReading();

      expect(section("Docker").parentElement?.className).not.toContain(
        "border-t",
      );
    });

    it("when a module title already opens the module, should not add a line above its first chapter too", () => {
      const only: BookReading["modules"] = [
        { id: "a", title: "A", chapters: [chapter("x", "Um", "# Um")] },
        { id: "b", title: "B", chapters: [chapter("y", "Dois", "# Dois")] },
      ];
      renderReading({ modules: only });

      expect(section("Dois").parentElement?.className).not.toContain(
        "border-t",
      );
    });
  });

  describe("completed mark", () => {
    it("when a chapter is unread, should offer a subtle Marcar como lido without a check beside the number", async () => {
      const onToggleRead = vi.fn();
      const user = userEvent.setup();
      renderReading({ onToggleRead });

      const label = within(section("Docker")).getByText("Capítulo 1");
      const button = within(section("Docker")).getByRole("button", {
        name: /Marcar como lido/,
      });

      expect(label.querySelector("svg")).toBeNull();
      expect(button).toHaveClass("text-muted-foreground");
      expect(button.className).not.toContain("bg-primary");

      await user.click(button);

      expect(onToggleRead).toHaveBeenCalledWith("d1", true);
    });

    it("when a chapter is read, should show a discreet green check beside the number and Lido in the footer", async () => {
      const onToggleRead = vi.fn();
      const user = userEvent.setup();
      renderReading({ readIds: ["d1"], onToggleRead });

      const label = within(section("Docker")).getByText("Capítulo 1");
      const button = within(section("Docker")).getByRole("button", {
        name: /^Lido$/,
      });

      expect(label.querySelector("svg")).toHaveClass("text-emerald-500");
      expect(button).toHaveClass("text-emerald-500");
      expect(button).toHaveAttribute("aria-pressed", "true");

      await user.click(button);

      expect(onToggleRead).toHaveBeenCalledWith("d1", false);
    });

    it("when no toggle handler is given, should not show any mark button", () => {
      renderReading();

      expect(
        screen.queryByRole("button", { name: /Marcar como lido|Lido/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("when a chapter has a next one, should offer a quiet button to go to it", async () => {
      const onGoToChapter = vi.fn();
      const user = userEvent.setup();
      renderReading({ onGoToChapter });

      const next = within(section("Docker")).getByRole("button", {
        name: /Próximo: Redes/,
      });

      expect(next).toHaveClass("text-muted-foreground");

      await user.click(next);

      expect(onGoToChapter).toHaveBeenCalledWith("d2");
    });

    it("when the chapter is the last one, should not offer a next button", () => {
      renderReading();

      expect(
        within(section("Kubernetes")).queryByRole("button", {
          name: /Próximo/,
        }),
      ).not.toBeInTheDocument();
    });

    it("when reading, should not show the links to open the pages", () => {
      renderReading();

      expect(
        screen.queryByRole("link", { name: "Abrir página" }),
      ).not.toBeInTheDocument();
    });
  });
});
