import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { ReadingMode } from "./ReadingMode";

describe("ReadingMode — actions", () => {
  it("when actions are given, should show them in the top bar next to the exit button", () => {
    render(
      <ReadingMode
        title="Livro"
        toc={null}
        onExit={() => {}}
        actions={<input aria-label="busca" />}
      >
        <p>texto</p>
      </ReadingMode>,
    );

    const region = screen.getByRole("region", { name: "Modo leitura" });
    const bar = region.firstElementChild as HTMLElement;

    expect(within(bar).getByLabelText("busca")).toBeInTheDocument();
    expect(
      within(bar).getByRole("button", { name: /Sair do modo leitura/ }),
    ).toBeInTheDocument();
  });

  it("when no actions are given, should show only the title and the exit button", () => {
    render(
      <ReadingMode title="Livro" toc={null} onExit={() => {}}>
        <p>texto</p>
      </ReadingMode>,
    );

    const bar = screen.getByRole("region", { name: "Modo leitura" })
      .firstElementChild as HTMLElement;

    expect(within(bar).queryByRole("searchbox")).not.toBeInTheDocument();
    expect(within(bar).getAllByRole("button")).toHaveLength(1);
  });
});
