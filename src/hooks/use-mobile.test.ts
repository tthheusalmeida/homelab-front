import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useIsMobile } from "./use-mobile";

function setup(width: number) {
  let listener: () => void = () => {};
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
    writable: true,
  });
  const mql = {
    addEventListener: vi.fn((_: string, cb: () => void) => (listener = cb)),
    removeEventListener: vi.fn(),
  };
  const matchMedia = vi.fn().mockReturnValue(mql);
  vi.stubGlobal("matchMedia", matchMedia);
  window.matchMedia = matchMedia as unknown as typeof window.matchMedia;

  return { mql, matchMedia, fire: () => listener() };
}

describe("useIsMobile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("when the window is narrower than 768px, should be mobile", () => {
    setup(500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("when the window is 768px or wider, should not be mobile", () => {
    setup(768);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("when the breakpoint media query changes, should update the value", () => {
    const { fire } = setup(1000);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 400;
      fire();
    });

    expect(result.current).toBe(true);
  });

  it("when unmounted, should remove the listener", () => {
    const { mql } = setup(1000);
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalled();
  });
});
