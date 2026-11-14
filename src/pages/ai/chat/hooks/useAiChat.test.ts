import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

vi.mock("#lib/api", () => ({ api: vi.fn() }));

import { api } from "#lib/api";

import { useAiChat } from "./useAiChat";

const request = {
  providerId: "ollama",
  modelId: "m",
  thinking: "off",
  message: "oi",
};

describe("useAiChat", () => {
  beforeEach(() => {
    vi.mocked(api).mockReset();
  });

  it("when initialized, should not be sending", () => {
    const { result } = renderHook(() => useAiChat());

    expect(result.current.isSending).toBe(false);
  });

  it("when a message is sent, should POST /chat with the body and an abort signal", async () => {
    vi.mocked(api).mockResolvedValue({ message: "resposta" });
    const { result } = renderHook(() => useAiChat());

    let response;
    await act(async () => {
      response = await result.current.sendMessage(request);
    });

    expect(response).toEqual({ message: "resposta" });
    const [path, options] = vi.mocked(api).mock.calls[0];
    expect(path).toBe("/chat");
    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(JSON.stringify(request));
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it("when the request is in flight, should be sending and then stop after it resolves", async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(api).mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useAiChat());

    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.sendMessage(request);
    });
    expect(result.current.isSending).toBe(true);

    await act(async () => {
      resolve({ message: "x" });
      await promise;
    });
    expect(result.current.isSending).toBe(false);
  });

  it("when the request fails, should rethrow and stop sending", async () => {
    vi.mocked(api).mockRejectedValue(new Error("falhou"));
    const { result } = renderHook(() => useAiChat());

    await act(async () => {
      await expect(result.current.sendMessage(request)).rejects.toThrow(
        "falhou",
      );
    });
    expect(result.current.isSending).toBe(false);
  });

  it("when abort is called, should abort the signal of the current request", () => {
    vi.mocked(api).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAiChat());

    act(() => {
      void result.current.sendMessage(request);
    });
    const signal = vi.mocked(api).mock.calls[0][1]?.signal as AbortSignal;

    act(() => result.current.abort());

    expect(signal.aborted).toBe(true);
  });

  it("when a new message is sent while another is pending, should abort the previous one", () => {
    vi.mocked(api).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAiChat());

    act(() => {
      void result.current.sendMessage(request);
      void result.current.sendMessage(request);
    });

    const first = vi.mocked(api).mock.calls[0][1]?.signal as AbortSignal;
    const second = vi.mocked(api).mock.calls[1][1]?.signal as AbortSignal;
    expect(first.aborted).toBe(true);
    expect(second.aborted).toBe(false);
  });
});
