import { afterEach, describe, expect, it, vi } from "vitest";

import { scrollToId } from "./scroll";

describe("scrollToId", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("when the element exists, should scroll to it smoothly", () => {
    const element = document.createElement("h2");
    element.id = "alvo";
    element.scrollIntoView = vi.fn();
    document.body.appendChild(element);

    scrollToId("alvo");

    expect(element.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("when the element does not exist, should do nothing", () => {
    expect(() => scrollToId("nao-existe")).not.toThrow();
  });
});
