import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useStoredState } from "./use-stored-state";

const allowed = ["list", "card"] as const;

describe("useStoredState", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("when nothing is stored, should use the fallback", () => {
    const { result } = renderHook(() => useStoredState("k", "list", allowed));

    expect(result.current[0]).toBe("list");
  });

  it("when a valid value is stored, should use it", () => {
    window.localStorage.setItem("k", "card");
    const { result } = renderHook(() => useStoredState("k", "list", allowed));

    expect(result.current[0]).toBe("card");
  });

  it("when the stored value is not allowed, should use the fallback", () => {
    window.localStorage.setItem("k", "outro");
    const { result } = renderHook(() => useStoredState("k", "list", allowed));

    expect(result.current[0]).toBe("list");
  });

  it("when the value is updated, should change the state and store it", () => {
    const { result } = renderHook(() => useStoredState("k", "list", allowed));

    act(() => result.current[1]("card"));

    expect(result.current[0]).toBe("card");
    expect(window.localStorage.getItem("k")).toBe("card");
  });

  it("when the storage throws, should still work for the session", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useStoredState("k", "list", allowed));

    act(() => result.current[1]("card"));

    expect(result.current[0]).toBe("card");
  });
});
