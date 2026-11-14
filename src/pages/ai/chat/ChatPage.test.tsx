import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const chat = {
  sendMessage: vi.fn(),
  abort: vi.fn(),
  isSending: false,
};
const providers = { data: [{ id: "ollama", label: "Ollama" }], isLoading: false };
const models = { data: [{ id: "m1", label: "M1", providerId: "ollama" }], isLoading: false };
const thinking = { data: [{ id: "off", label: "Desativado" }], isLoading: false };
const useAiModelsSpy = vi.fn();
const useAiThinkingSpy = vi.fn();

vi.mock("./hooks/useAiChat", () => ({ useAiChat: () => chat }));
vi.mock("./hooks/useAiProviders", () => ({ useAiProviders: () => providers }));
vi.mock("./hooks/useAiModels", () => ({
  useAiModels: (...args: unknown[]) => {
    useAiModelsSpy(...args);
    return models;
  },
}));
vi.mock("./hooks/useAiThinking", () => ({
  useAiThinking: (...args: unknown[]) => {
    useAiThinkingSpy(...args);
    return thinking;
  },
}));
vi.mock("./components/ChatSettings", () => ({ ChatSettings: () => null }));

import { ChatPage } from "./ChatPage";

const textbox = () => screen.getByPlaceholderText("Envie uma mensagem...");
const sendButton = () => screen.getByRole("button");

describe("ChatPage", () => {
  beforeEach(() => {
    chat.sendMessage.mockReset();
    chat.abort.mockReset();
    chat.isSending = false;
    providers.isLoading = false;
    models.isLoading = false;
    thinking.isLoading = false;
    useAiModelsSpy.mockClear();
    useAiThinkingSpy.mockClear();
  });

  it("when there are no messages, should show the empty state", () => {
    render(<ChatPage />);

    expect(screen.getByText("Como posso te ajudar hoje?")).toBeInTheDocument();
  });

  it("when the message is empty, should keep send disabled", () => {
    render(<ChatPage />);

    expect(sendButton()).toBeDisabled();
  });

  it("when nothing is chosen, should default to the first provider, model and thinking option", () => {
    render(<ChatPage />);

    expect(useAiModelsSpy).toHaveBeenCalledWith("ollama");
    expect(useAiThinkingSpy).toHaveBeenCalledWith({
      providerId: "ollama",
      modelId: "m1",
    });
  });

  it("when options are still loading, should keep send disabled", async () => {
    thinking.isLoading = true;
    const user = userEvent.setup();
    render(<ChatPage />);

    await user.type(textbox(), "oi");

    expect(sendButton()).toBeDisabled();
  });

  it("when a message is sent, should show the user message then the assistant answer", async () => {
    chat.sendMessage.mockResolvedValue({ message: "olá, humano" });
    const user = userEvent.setup();
    render(<ChatPage />);

    await user.type(textbox(), "  oi  ");
    await user.click(sendButton());

    expect(chat.sendMessage).toHaveBeenCalledWith({
      providerId: "ollama",
      modelId: "m1",
      thinking: "off",
      message: "oi",
    });
    expect(await screen.findByText("olá, humano")).toBeInTheDocument();
    expect(screen.getByText("oi")).toBeInTheDocument();
    expect(textbox()).toHaveValue("");
  });

  it("when Enter is pressed, should send; when Shift+Enter, should not", async () => {
    chat.sendMessage.mockResolvedValue({ message: "ok" });
    const user = userEvent.setup();
    render(<ChatPage />);

    await user.type(textbox(), "a{Shift>}{Enter}{/Shift}b");
    expect(chat.sendMessage).not.toHaveBeenCalled();

    await user.type(textbox(), "{Enter}");
    await waitFor(() => expect(chat.sendMessage).toHaveBeenCalledOnce());
  });

  it("when the request is aborted, should show the cancelled status", async () => {
    chat.sendMessage.mockRejectedValue(new DOMException("x", "AbortError"));
    const user = userEvent.setup();
    render(<ChatPage />);

    await user.type(textbox(), "oi");
    await user.click(sendButton());

    expect(await screen.findByText("Geração cancelada")).toBeInTheDocument();
  });

  it("when the request fails, should log the error and not add an assistant message", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    chat.sendMessage.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    render(<ChatPage />);

    await user.type(textbox(), "oi");
    await user.click(sendButton());

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(screen.getByText("oi")).toBeInTheDocument();
    expect(screen.queryByText("Geração cancelada")).not.toBeInTheDocument();
  });

  it("when send is clicked while sending, should abort instead of sending again", async () => {
    chat.isSending = true;
    const user = userEvent.setup();
    render(<ChatPage />);

    await user.click(sendButton());

    expect(chat.abort).toHaveBeenCalledOnce();
    expect(chat.sendMessage).not.toHaveBeenCalled();
    expect(await screen.findByText("Geração cancelada")).toBeInTheDocument();
  });
});
