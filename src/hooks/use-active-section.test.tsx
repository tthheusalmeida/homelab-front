import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { findActiveId, useActiveSection } from "./use-active-section";

const tops = (map: Record<string, number | null>) => (id: string) =>
  id in map ? map[id] : null;

describe("findActiveId", () => {
  it("when several sections passed the offset, should pick the last of them", () => {
    expect(
      findActiveId(["a", "b", "c"], tops({ a: -300, b: -20, c: 400 })),
    ).toBe("b");
  });

  it("when none reached the offset yet, should pick the first one on the page", () => {
    expect(findActiveId(["a", "b"], tops({ a: 300, b: 900 }))).toBe("a");
  });

  it("when a section is exactly at the offset, should count as reached", () => {
    expect(findActiveId(["a", "b"], tops({ a: -10, b: 120 }), 120)).toBe("b");
  });

  it("when a section is not on the page, should skip it", () => {
    expect(
      findActiveId(["a", "b", "c"], tops({ a: null, b: 500, c: 800 })),
    ).toBe("b");
  });

  it("when there are no ids or none on the page, should return undefined", () => {
    expect(findActiveId([], tops({}))).toBeUndefined();
    expect(findActiveId(["x"], tops({}))).toBeUndefined();
  });
});

function Probe({ ids }: { ids: string[] }) {
  const active = useActiveSection(ids);

  return <p data-testid="active">{active ?? "nenhum"}</p>;
}

function mockRects(map: Record<string, number>) {
  for (const [id, top] of Object.entries(map)) {
    const element = document.getElementById(id)!;

    element.getBoundingClientRect = () => ({ top }) as DOMRect;
  }
}

const immediateFrames = () =>
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });

describe("useActiveSection", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("when mounted, should start with the section at the top", () => {
    const host = document.createElement("div");
    host.innerHTML = '<h2 id="a"></h2><h2 id="b"></h2>';
    document.body.appendChild(host);
    mockRects({ a: 20, b: 600 });

    render(<Probe ids={["a", "b"]} />);

    expect(screen.getByTestId("active")).toHaveTextContent("a");
  });

  it("when the page scrolls, should move to the section being read", () => {
    immediateFrames();
    const host = document.createElement("div");
    host.innerHTML = '<h2 id="a"></h2><h2 id="b"></h2>';
    document.body.appendChild(host);
    mockRects({ a: 20, b: 600 });
    render(<Probe ids={["a", "b"]} />);

    mockRects({ a: -500, b: 50 });
    act(() => {
      document.dispatchEvent(new Event("scroll"));
    });

    expect(screen.getByTestId("active")).toHaveTextContent("b");
  });

  it("when a scrollable area inside the page scrolls, should still follow it", () => {
    immediateFrames();
    const host = document.createElement("div");
    host.id = "area";
    host.innerHTML = '<h2 id="a"></h2><h2 id="b"></h2>';
    document.body.appendChild(host);
    mockRects({ a: 20, b: 600 });
    render(<Probe ids={["a", "b"]} />);

    mockRects({ a: -500, b: 50 });
    act(() => {
      host.dispatchEvent(new Event("scroll"));
    });

    expect(screen.getByTestId("active")).toHaveTextContent("b");
  });

  it("when there are no ids, should have no active section", () => {
    render(<Probe ids={[]} />);

    expect(screen.getByTestId("active")).toHaveTextContent("nenhum");
  });

  it("when unmounted, should stop listening", () => {
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Probe ids={["a"]} />);

    unmount();

    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function), {
      capture: true,
    });
  });
});
