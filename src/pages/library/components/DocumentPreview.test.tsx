import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DocumentPreview } from "./DocumentPreview";

describe("DocumentPreview", () => {
  it("when the title is empty, should show a placeholder", () => {
    render(<DocumentPreview title="  " category={[]} tags={[]} />);

    expect(screen.getByText("Sem título ainda")).toBeInTheDocument();
  });

  it("when there is a category, should show the breadcrumb and the folder", () => {
    render(
      <DocumentPreview title="Ligações" category={["Ciência", "Química"]} tags={[]} />,
    );

    expect(screen.getByRole("navigation", { name: "Categoria na prévia" })).toHaveTextContent(
      "CiênciaQuímica",
    );
    expect(screen.getByText("biblioteca / Ciência / Química")).toBeInTheDocument();
  });

  it("when there are tags, should list them; otherwise should say Sem tags", () => {
    const { rerender } = render(
      <DocumentPreview title="T" category={["A"]} tags={["docker", "prova"]} />,
    );

    expect(screen.getByText("docker")).toBeInTheDocument();
    expect(screen.getByText("prova")).toBeInTheDocument();

    rerender(<DocumentPreview title="T" category={["A"]} tags={[]} />);

    expect(screen.getByText("Sem tags")).toBeInTheDocument();
  });

  it("when an excerpt is given, should show it", () => {
    render(<DocumentPreview title="T" category={["A"]} tags={[]} excerpt="Resumo curto" />);

    expect(screen.getByText("Resumo curto")).toBeInTheDocument();
  });
});
