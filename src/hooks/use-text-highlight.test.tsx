import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";

import { useTextHighlight } from "./use-text-highlight";

function Host({ text }: { text?: string }) {
  return (
    <div data-testid="host">
      <p>{text ?? "O Docker usa imagens. Cada imagem vira um contêiner."}</p>
      <p>Outro parágrafo sobre IMAGEM e rede.</p>
    </div>
  );
}

function setup(query: string, text?: string) {
  const view = render(<Host text={text} />);
  const container = screen.getByTestId("host");
  const hook = renderHook(
    ({ q, version }) => useTextHighlight(container, q, version),
    { initialProps: { q: query, version: 0 } },
  );

  return { ...view, hook, container };
}

describe("useTextHighlight", () => {
  let scrolled: Element[];

  beforeEach(() => {
    scrolled = [];
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this);
    };
  });

  afterEach(() => {
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    vi.unstubAllGlobals();
  });

  it("when the query is empty, should find nothing", () => {
    const { hook } = setup("");

    expect(hook.result.current).toMatchObject({ count: 0, index: -1 });
  });

  it("when the query is too short, should find nothing", () => {
    const { hook } = setup("i");

    expect(hook.result.current.count).toBe(0);
  });

  it("when the term appears in several paragraphs, should count every occurrence ignoring case and accent", () => {
    const { hook } = setup("imagem");

    // "Cada imagem" e "IMAGEM" (a palavra "imagens" é outra)
    expect(hook.result.current.count).toBe(2);
    expect(hook.result.current.index).toBe(0);
  });

  it("when the query has an accent, should match the text without it", () => {
    const { hook } = setup("conteiner");

    expect(hook.result.current.count).toBe(1);
  });

  it("when a new query is typed, should scroll to the first occurrence", () => {
    setup("imagem");

    expect(scrolled).toHaveLength(1);
    expect(scrolled[0].tagName).toBe("P");
  });

  it("when next is called, should go to the following occurrence and scroll to it", () => {
    const { hook } = setup("imagem");
    scrolled.length = 0;

    act(() => hook.result.current.next());

    expect(hook.result.current.index).toBe(1);
    expect(scrolled).toHaveLength(1);
  });

  it("when next is called on the last occurrence, should wrap to the first", () => {
    const { hook } = setup("imagem");

    act(() => hook.result.current.next());
    act(() => hook.result.current.next());

    expect(hook.result.current.index).toBe(0);
  });

  it("when prev is called on the first occurrence, should wrap to the last", () => {
    const { hook } = setup("imagem");

    act(() => hook.result.current.prev());

    expect(hook.result.current.index).toBe(1);
  });

  it("when there is no occurrence, should not move or scroll on next and prev", () => {
    const { hook } = setup("inexistente");
    scrolled.length = 0;

    act(() => hook.result.current.next());
    act(() => hook.result.current.prev());

    expect(hook.result.current).toMatchObject({ count: 0, index: -1 });
    expect(scrolled).toHaveLength(0);
  });

  it("when the query changes, should recount and go back to the first occurrence", () => {
    const { hook } = setup("imagem");
    act(() => hook.result.current.next());

    hook.rerender({ q: "rede", version: 0 });

    expect(hook.result.current).toMatchObject({ count: 1, index: 0 });
  });

  it("when the query is cleared, should drop the results", () => {
    const { hook } = setup("imagem");

    hook.rerender({ q: "", version: 0 });

    expect(hook.result.current).toMatchObject({ count: 0, index: -1 });
  });

  it("when the text is redrawn with the same query, should keep the current occurrence", () => {
    const { hook } = setup("imagem");
    act(() => hook.result.current.next());

    hook.rerender({ q: "imagem", version: 1 });

    expect(hook.result.current.index).toBe(1);
  });

  it("when there is no container yet, should find nothing", () => {
    const { result } = renderHook(() => useTextHighlight(null, "imagem"));

    expect(result.current.count).toBe(0);
  });

  describe("with the CSS Custom Highlight API", () => {
    it("when supported, should paint every match and the current one, and clear them on unmount", () => {
      const store = new Map<string, unknown>();

      class FakeHighlight {
        ranges: Range[];
        constructor(...ranges: Range[]) {
          this.ranges = ranges;
        }
      }

      vi.stubGlobal("Highlight", FakeHighlight);
      vi.stubGlobal("CSS", {
        highlights: {
          set: (name: string, value: unknown) => store.set(name, value),
          delete: (name: string) => store.delete(name),
        },
      });

      const { hook } = setup("imagem");

      expect((store.get("find-match") as FakeHighlight).ranges).toHaveLength(2);
      expect((store.get("find-current") as FakeHighlight).ranges).toHaveLength(
        1,
      );

      hook.unmount();

      expect(store.has("find-match")).toBe(false);
      expect(store.has("find-current")).toBe(false);
    });
  });
});
