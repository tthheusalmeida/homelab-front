import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReadingMode } from "./ReadingMode";

const setup = (onExit = vi.fn()) => {
  render(
    <ReadingMode
      title="Pós em DevOps"
      toc={<p>itens do sumário</p>}
      onExit={onExit}
    >
      <p>texto para ler</p>
    </ReadingMode>,
  );

  return { onExit, user: userEvent.setup() };
};

describe("ReadingMode", () => {
  it("when open, should show only the title, the text and the summary", () => {
    setup();

    const region = screen.getByRole("region", { name: "Modo leitura" });

    expect(within(region).getByText("Pós em DevOps")).toBeInTheDocument();
    expect(within(region).getByText("texto para ler")).toBeInTheDocument();
    expect(
      within(
        within(region).getByRole("complementary", {
          name: "Sumário da leitura",
        }),
      ).getByText("itens do sumário"),
    ).toBeInTheDocument();
  });

  it("when open, should cover the whole screen on top of the app", () => {
    setup();

    expect(screen.getByRole("region", { name: "Modo leitura" })).toHaveClass(
      "fixed",
      "inset-0",
      "z-50",
    );
  });

  it("when open, should render outside the page tree so it covers the layout", () => {
    const { container } = render(
      <div>
        <ReadingMode title="T" toc={null} onExit={() => {}}>
          <p>x</p>
        </ReadingMode>
      </div>,
    );

    expect(container).not.toContainElement(
      screen.getByRole("region", { name: "Modo leitura" }),
    );
  });

  it("when the exit button is clicked, should call onExit", async () => {
    const { onExit, user } = setup();

    await user.click(
      screen.getByRole("button", { name: /Sair do modo leitura/ }),
    );

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("when Escape is pressed, should call onExit", async () => {
    const { onExit, user } = setup();

    await user.keyboard("{Escape}");

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("when another key is pressed, should not exit", async () => {
    const { onExit, user } = setup();

    await user.keyboard("a");

    expect(onExit).not.toHaveBeenCalled();
  });

  it("when closed, should stop listening to Escape", async () => {
    const onExit = vi.fn();
    const { unmount } = render(
      <ReadingMode title="T" toc={null} onExit={onExit}>
        <p>x</p>
      </ReadingMode>,
    );
    unmount();

    await userEvent.setup().keyboard("{Escape}");

    expect(onExit).not.toHaveBeenCalled();
  });
});
