import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";

import { useBackToTop } from "./use-back-to-top";

function scrollTo(element: Element | Document, top: number) {
  const target = element === document ? document.documentElement : element;

  Object.defineProperty(target, "scrollTop", {
    value: top,
    configurable: true,
    writable: true,
  });
  act(() => {
    element.dispatchEvent(new Event("scroll"));
  });
}

function Layout() {
  return (
    <div data-testid="scroller">
      <div data-testid="content">
        <p>texto</p>
      </div>

      <ul data-testid="side-list">
        <li>item</li>
      </ul>
    </div>
  );
}

describe("useBackToTop", () => {
  afterEach(() => {
    Object.defineProperty(document.documentElement, "scrollTop", {
      value: 0,
      configurable: true,
      writable: true,
    });
  });

  it("when there is no container yet, should stay hidden", () => {
    const { result } = renderHook(() => useBackToTop(null));

    expect(result.current.visible).toBe(false);
  });

  it("when the area scrolls past the threshold, should become visible", () => {
    render(<Layout />);
    const content = screen.getByTestId("content");
    const { result } = renderHook(() => useBackToTop(content, 400));

    scrollTo(screen.getByTestId("scroller"), 500);

    expect(result.current.visible).toBe(true);
  });

  it("when the area is scrolled only a little, should stay hidden", () => {
    render(<Layout />);
    const { result } = renderHook(() =>
      useBackToTop(screen.getByTestId("content"), 400),
    );

    scrollTo(screen.getByTestId("scroller"), 399);

    expect(result.current.visible).toBe(false);
  });

  it("when the reader goes back to the start, should hide again", () => {
    render(<Layout />);
    const { result } = renderHook(() =>
      useBackToTop(screen.getByTestId("content"), 400),
    );
    const scroller = screen.getByTestId("scroller");

    scrollTo(scroller, 900);
    scrollTo(scroller, 10);

    expect(result.current.visible).toBe(false);
  });

  it("when the whole page (document) scrolls, should also follow it", () => {
    render(<Layout />);
    const { result } = renderHook(() =>
      useBackToTop(screen.getByTestId("content"), 400),
    );

    scrollTo(document, 800);

    expect(result.current.visible).toBe(true);
  });

  it("when a list that does not contain the content scrolls, should ignore it", () => {
    render(<Layout />);
    const { result } = renderHook(() =>
      useBackToTop(screen.getByTestId("content"), 400),
    );

    scrollTo(screen.getByTestId("side-list"), 900);

    expect(result.current.visible).toBe(false);
  });

  it("when toTop is called, should scroll the area that was scrolled to the top smoothly", () => {
    render(<Layout />);
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTo = vi.fn() as unknown as typeof scroller.scrollTo;
    const { result } = renderHook(() =>
      useBackToTop(screen.getByTestId("content"), 400),
    );
    scrollTo(scroller, 900);

    act(() => result.current.toTop());

    expect(scroller.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("when unmounted, should stop listening", () => {
    const remove = vi.spyOn(document, "removeEventListener");
    render(<Layout />);
    const { unmount } = renderHook(() =>
      useBackToTop(screen.getByTestId("content")),
    );

    unmount();

    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
  });
});

describe("useBackToTop — going up", () => {
  function setup() {
    render(<Layout />);
    const scroller = screen.getByTestId("scroller");
    scroller.scrollTo = vi.fn() as unknown as typeof scroller.scrollTo;
    const { result } = renderHook(() =>
      useBackToTop(screen.getByTestId("content"), 400),
    );

    return { scroller, result };
  }

  it("when toTop is called, should hide the button right away, before the page reaches the threshold", () => {
    const { scroller, result } = setup();
    scrollTo(scroller, 3000);
    expect(result.current.visible).toBe(true);

    act(() => result.current.toTop());

    expect(result.current.visible).toBe(false);
  });

  it("when the page is still going up and above the threshold, should keep the button hidden", () => {
    const { scroller, result } = setup();
    scrollTo(scroller, 3000);
    act(() => result.current.toTop());

    scrollTo(scroller, 2400);
    scrollTo(scroller, 1500);
    scrollTo(scroller, 600);

    expect(result.current.visible).toBe(false);
  });

  it("when the page arrives at the top, should stay hidden and go back to normal", () => {
    const { scroller, result } = setup();
    scrollTo(scroller, 3000);
    act(() => result.current.toTop());

    scrollTo(scroller, 0);
    expect(result.current.visible).toBe(false);

    scrollTo(scroller, 900);
    expect(result.current.visible).toBe(true);
  });

  it("when the reader scrolls down again while going up, should show the button again", () => {
    const { scroller, result } = setup();
    scrollTo(scroller, 3000);
    act(() => result.current.toTop());
    scrollTo(scroller, 2000);

    scrollTo(scroller, 2600);

    expect(result.current.visible).toBe(true);
  });
});
