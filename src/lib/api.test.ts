import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "./api";

function mockFetch(response: Partial<Response>) {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("when the response is ok, should return the parsed json", async () => {
    mockFetch({ ok: true, json: () => Promise.resolve({ a: 1 }) });

    await expect(api("/x")).resolves.toEqual({ a: 1 });
  });

  it("when called, should prefix the path with VITE_API_URL and send json content type", async () => {
    const fetchMock = mockFetch({ ok: true, json: () => Promise.resolve({}) });

    await api("/jobs");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${import.meta.env.VITE_API_URL}/jobs`);
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("when options are given, should forward them and let headers override defaults", async () => {
    const fetchMock = mockFetch({ ok: true, json: () => Promise.resolve({}) });

    await api("/x", {
      method: "POST",
      body: "b",
      headers: { "Content-Type": "text/plain", "X-Test": "1" },
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body).toBe("b");
    expect(options.headers).toEqual({
      "Content-Type": "text/plain",
      "X-Test": "1",
    });
  });

  it("when the response is 204 No Content, should return undefined without reading a body", async () => {
    const json = vi.fn();
    mockFetch({ ok: true, status: 204, json });

    await expect(api("/x", { method: "DELETE" })).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("when the response is not ok, should throw an error with the status", async () => {
    mockFetch({ ok: false, status: 500 });

    await expect(api("/x")).rejects.toThrow("API error: 500");
  });
});
