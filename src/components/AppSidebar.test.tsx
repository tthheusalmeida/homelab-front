import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";

import { SidebarProvider } from "#ui/sidebar";

import { AppSidebar } from "./AppSidebar";

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

const renderSidebar = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SidebarProvider>
        <AppSidebar />
        <Where />
      </SidebarProvider>
    </MemoryRouter>,
  );

describe("AppSidebar", () => {
  it("when rendered, should show the Biblioteca section right after the section with Início", () => {
    renderSidebar();

    const labels = ["HomeLab", "Biblioteca", "AI", "Jobs"].map((label) =>
      screen.getByText(label),
    );

    for (let i = 0; i < labels.length - 1; i++) {
      expect(
        labels[i].compareDocumentPosition(labels[i + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getByText("Início")).toBeInTheDocument();
  });

  it("when rendered, should list the library items", () => {
    renderSidebar();

    for (const title of ["Acervo", "Entrada", "Novo artigo"]) {
      expect(screen.getByRole("button", { name: title })).toBeInTheDocument();
    }
  });

  it.each([
    ["Acervo", "/library"],
    ["Entrada", "/library/inbox"],
    ["Novo artigo", "/library/new"],
  ])("when %s is clicked, should navigate to %s", async (title, path) => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole("button", { name: title }));

    expect(screen.getByTestId("where")).toHaveTextContent(path);
  });

  it("when on a library route, should mark that item as active", () => {
    renderSidebar("/library/inbox");

    expect(screen.getByRole("button", { name: "Entrada" })).toHaveAttribute(
      "data-active",
    );
    expect(
      screen.getByRole("button", { name: "Acervo" }),
    ).not.toHaveAttribute("data-active");
  });
});
