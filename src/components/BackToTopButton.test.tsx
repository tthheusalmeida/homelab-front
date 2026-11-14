import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BackToTopButton } from "./BackToTopButton";

function setup() {
  render(
    <div data-testid="scroller">
      <div data-testid="column">
        <p>texto longo</p>
      </div>
    </div>,
  );

  const scroller = screen.getByTestId("scroller");
  scroller.scrollTo = vi.fn() as unknown as typeof scroller.scrollTo;

  const column = screen.getByTestId("column");

  render(
    <div data-testid="host">
      <BackToTopButton container={column} />
    </div>,
  );

  return { scroller };
}

function scrollTo(element: HTMLElement, top: number) {
  Object.defineProperty(element, "scrollTop", {
    value: top,
    configurable: true,
    writable: true,
  });
  act(() => {
    element.dispatchEvent(new Event("scroll"));
  });
}

describe("BackToTopButton", () => {
  it("when the reader is still at the start, should not show the button", () => {
    setup();

    expect(
      screen.queryByRole("button", { name: "Voltar ao topo" }),
    ).not.toBeInTheDocument();
  });

  it("when the reader scrolls down, should show an accessible button", () => {
    const { scroller } = setup();

    scrollTo(scroller, 800);

    const button = screen.getByRole("button", { name: "Voltar ao topo" });

    expect(button).toHaveAttribute("title", "Voltar ao topo");
    expect(button).toHaveAttribute("type", "button");
  });

  it("when shown, should sit fixed in the bottom right corner of the page, outside the text", () => {
    const { scroller } = setup();

    scrollTo(scroller, 800);

    const button = screen.getByRole("button", { name: "Voltar ao topo" });

    expect(button).toHaveClass("fixed", "right-4", "bottom-4", "z-40");
    expect(button.closest("[data-testid=column]")).toBeNull();
  });

  it("when shown, should be a single small button with no wrapper that could block clicks", () => {
    const { scroller } = setup();

    scrollTo(scroller, 800);

    const button = screen.getByRole("button", { name: "Voltar ao topo" });

    expect(button.parentElement).toBe(screen.getByTestId("host"));
  });

  it("when clicked, should scroll back to the top", async () => {
    const { scroller } = setup();
    scrollTo(scroller, 800);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Voltar ao topo" }));

    expect(scroller.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("when activated with the keyboard, should also scroll to the top", async () => {
    const { scroller } = setup();
    scrollTo(scroller, 800);
    const user = userEvent.setup();

    await user.tab();
    await user.keyboard("{Enter}");

    expect(scroller.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("when the reader returns to the start, should hide the button again", () => {
    const { scroller } = setup();

    scrollTo(scroller, 800);
    scrollTo(scroller, 0);

    expect(
      screen.queryByRole("button", { name: "Voltar ao topo" }),
    ).not.toBeInTheDocument();
  });
});

describe("BackToTopButton — transition", () => {
  const button = () =>
    document.querySelector("[data-slot=back-to-top]") as HTMLElement;

  it("when hidden, should stay in the page ready to fade, but out of reach of keyboard, readers and clicks", () => {
    setup();

    expect(button()).toBeInTheDocument();
    expect(button()).toHaveAttribute("aria-hidden", "true");
    expect(button()).toHaveAttribute("tabindex", "-1");
    expect(button()).toHaveClass(
      "opacity-0",
      "invisible",
      "pointer-events-none",
    );
  });

  it("when visible, should be fully shown and reachable", () => {
    const { scroller } = setup();

    scrollTo(scroller, 800);

    expect(button()).toHaveAttribute("aria-hidden", "false");
    expect(button()).toHaveAttribute("tabindex", "0");
    expect(button()).toHaveClass("opacity-100", "translate-y-0");
    expect(button()).not.toHaveClass("invisible");
  });

  it("when changing state, should animate opacity, movement and visibility, respecting reduced motion", () => {
    setup();

    expect(button().className).toContain(
      "transition-[opacity,transform,visibility]",
    );
    expect(button()).toHaveClass(
      "duration-300",
      "motion-reduce:transition-none",
    );
  });

  it("when clicked, should fade out at once while the page is still going up", async () => {
    const { scroller } = setup();
    scrollTo(scroller, 3000);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Voltar ao topo" }));

    expect(button()).toHaveClass("opacity-0", "invisible");
    expect(button()).toHaveAttribute("aria-hidden", "true");

    scrollTo(scroller, 1800);
    expect(button()).toHaveClass("opacity-0");
  });

  it("when the reader scrolls down after going up, should fade back in", async () => {
    const { scroller } = setup();
    scrollTo(scroller, 3000);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Voltar ao topo" }));
    scrollTo(scroller, 0);

    scrollTo(scroller, 900);

    expect(button()).toHaveClass("opacity-100");
  });
});
