import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DocumentSidebar } from "./DocumentSidebar";

const headings = [
  { level: 1, text: "Introdução", id: "introducao" },
  { level: 2, text: "Detalhes", id: "detalhes" },
];

describe("DocumentSidebar", () => {
  describe("outline", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("when there are two or more headings, should show the Sumário", () => {
      render(
        <DocumentSidebar
          headings={headings}
          onOpenAbout={() => {}}
          onStartReading={() => {}}
        />,
      );

      const nav = screen.getByRole("navigation", { name: "Sumário" });

      expect(within(nav).getByText("Introdução")).toBeInTheDocument();
      expect(within(nav).getByText("Detalhes")).toBeInTheDocument();
    });

    it.each([[[]], [[headings[0]]]])(
      "when there are fewer than two headings (%j), should hide the Sumário",
      (list) => {
        render(
          <DocumentSidebar
            headings={list}
            onOpenAbout={() => {}}
            onStartReading={() => {}}
          />,
        );

        expect(
          screen.queryByRole("navigation", { name: "Sumário" }),
        ).not.toBeInTheDocument();
      },
    );

    it("when a heading is clicked, should scroll its element into view", async () => {
      const scrollIntoView = vi.fn();
      const target = document.createElement("h2");
      target.id = "detalhes";
      target.scrollIntoView = scrollIntoView;
      document.body.appendChild(target);
      const user = userEvent.setup();
      render(
        <DocumentSidebar
          headings={headings}
          onOpenAbout={() => {}}
          onStartReading={() => {}}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Detalhes" }));

      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    it("when the target element does not exist, should not fail on click", async () => {
      const user = userEvent.setup();
      render(
        <DocumentSidebar
          headings={headings}
          onOpenAbout={() => {}}
          onStartReading={() => {}}
        />,
      );

      await user.click(screen.getByRole("button", { name: "Detalhes" }));

      expect(
        screen.getByRole("button", { name: "Detalhes" }),
      ).toBeInTheDocument();
    });

    it("when headings are nested, should indent deeper levels", () => {
      render(
        <DocumentSidebar
          headings={headings}
          onOpenAbout={() => {}}
          onStartReading={() => {}}
        />,
      );

      const first = screen.getByRole("button", { name: "Introdução" });
      const second = screen.getByRole("button", { name: "Detalhes" });

      expect(first.closest("li")).toHaveStyle({ paddingLeft: "0rem" });
      expect(second.closest("li")).toHaveStyle({ paddingLeft: "0.75rem" });
    });
  });

  it("when Sobre a página is clicked, should ask to open the about window", async () => {
    const onOpenAbout = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentSidebar
        headings={[]}
        onOpenAbout={onOpenAbout}
        onStartReading={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Sobre a página/ }));

    expect(onOpenAbout).toHaveBeenCalledTimes(1);
  });

  it("when rendered, should not show the document information", () => {
    render(
      <DocumentSidebar
        headings={[]}
        onOpenAbout={() => {}}
        onStartReading={() => {}}
      />,
    );

    expect(screen.queryByText("Situação")).not.toBeInTheDocument();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
  });

  it("when there is a Sumário, should show it before the Sobre a página button", () => {
    render(
      <DocumentSidebar
        headings={headings}
        onOpenAbout={() => {}}
        onStartReading={() => {}}
      />,
    );

    const index = screen.getByText("Sumário", {
      selector: "[data-slot=card-title]",
    });
    const about = screen.getByRole("button", { name: /Sobre a página/ });

    expect(
      index.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("when the layout is wide, should be sticky on the right side", () => {
    render(
      <DocumentSidebar
        headings={[]}
        onOpenAbout={() => {}}
        onStartReading={() => {}}
      />,
    );

    expect(
      screen.getByRole("complementary", { name: "Informações da página" }),
    ).toHaveClass("lg:sticky", "lg:top-4", "lg:self-start");
  });
});

describe("DocumentSidebar — reading", () => {
  it("when Modo leitura is clicked, should ask to start the reading mode", async () => {
    const onStartReading = vi.fn();
    const user = userEvent.setup();
    render(
      <DocumentSidebar
        headings={[]}
        onOpenAbout={() => {}}
        onStartReading={onStartReading}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Modo leitura/ }));

    expect(onStartReading).toHaveBeenCalledTimes(1);
  });

  it("when a heading is the active one, should highlight only it in the Sumário", () => {
    render(
      <DocumentSidebar
        headings={headings}
        activeId="detalhes"
        onOpenAbout={() => {}}
        onStartReading={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Detalhes" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("button", { name: "Detalhes" })).toHaveClass(
      "text-primary",
    );
    expect(
      screen.getByRole("button", { name: "Introdução" }),
    ).not.toHaveAttribute("aria-current");
  });
});
