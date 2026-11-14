import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatComposer } from "./ChatComposer";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageList } from "./ChatMessageList";

describe("ChatComposer", () => {
  const setup = (props: Partial<React.ComponentProps<typeof ChatComposer>> = {}) => {
    const onChange = vi.fn();
    const onSend = vi.fn();
    render(
      <ChatComposer
        value="texto"
        onChange={onChange}
        onSend={onSend}
        settings={<span>config</span>}
        {...props}
      />,
    );
    return { onChange, onSend, user: userEvent.setup() };
  };

  const box = () => screen.getByPlaceholderText("Envie uma mensagem...");

  it("when typing, should call onChange with the new value", async () => {
    const { onChange, user } = setup({ value: "" });

    await user.type(box(), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("when Enter is pressed, should send", async () => {
    const { onSend, user } = setup();

    await user.type(box(), "{Enter}");

    expect(onSend).toHaveBeenCalledOnce();
  });

  it("when Shift+Enter is pressed, should not send", async () => {
    const { onSend, user } = setup();

    await user.type(box(), "{Shift>}{Enter}{/Shift}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("when disabled, should not send on Enter", async () => {
    const { onSend, user } = setup({ disabled: true });

    await user.type(box(), "{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("when sending, should not send on Enter", async () => {
    const { onSend, user } = setup({ isSending: true });

    await user.type(box(), "{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("when the button is clicked, should send", async () => {
    const { onSend, user } = setup();

    await user.click(screen.getByRole("button"));

    expect(onSend).toHaveBeenCalledOnce();
  });

  it("when disabled, should disable the button", () => {
    setup({ disabled: true });

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("when rendered, should show the settings slot and the keyboard hint", () => {
    setup();

    expect(screen.getByText("config")).toBeInTheDocument();
    expect(screen.getByText(/Shift \+ Enter para nova linha/)).toBeInTheDocument();
  });
});

describe("ChatMessage", () => {
  it("when the role is user, should show the content as plain text", () => {
    render(
      <ChatMessage message={{ id: "1", role: "user", content: "**oi**" }} />,
    );

    expect(screen.getByText("**oi**")).toBeInTheDocument();
  });

  it("when the role is assistant, should render the content as markdown", () => {
    render(
      <ChatMessage
        message={{ id: "1", role: "assistant", content: "**oi**" }}
      />,
    );

    expect(screen.getByText("oi").tagName).toBe("STRONG");
  });
});

describe("ChatMessageList", () => {
  const messages = [
    { id: "1", role: "user" as const, content: "pergunta" },
    { id: "2", role: "assistant" as const, content: "resposta" },
  ];

  it("when given messages, should render all of them", () => {
    render(<ChatMessageList messages={messages} />);

    expect(screen.getByText("pergunta")).toBeInTheDocument();
    expect(screen.getByText("resposta")).toBeInTheDocument();
  });

  it("when status is sending, should show Pensando", () => {
    render(<ChatMessageList messages={messages} status="sending" />);

    expect(screen.getByText("Pensando")).toBeInTheDocument();
  });

  it("when status is cancelled, should show Geração cancelada without dots", () => {
    render(<ChatMessageList messages={messages} status="cancelled" />);

    expect(screen.getByText("Geração cancelada")).toBeInTheDocument();
    expect(screen.queryByText(".")).not.toBeInTheDocument();
  });

  it("when status is idle, should show no status message", () => {
    render(<ChatMessageList messages={messages} />);

    expect(screen.queryByText("Pensando")).not.toBeInTheDocument();
    expect(screen.queryByText("Geração cancelada")).not.toBeInTheDocument();
  });
});

describe("ChatEmptyState", () => {
  it("when rendered, should show the greeting", () => {
    render(<ChatEmptyState />);

    expect(screen.getByText("Como posso te ajudar hoje?")).toBeInTheDocument();
  });

  it("when time passes, should type the first phrase letter by letter", async () => {
    vi.useFakeTimers();
    try {
      render(<ChatEmptyState />);

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(70);
        });
      }

      expect(screen.getByText("Exp")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
