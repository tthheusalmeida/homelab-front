import { Bot, User } from "lucide-react";

import type { AiMessage } from "../types/chat";
import { MarkdownMessage } from "#components/MarkdownMessage";

interface ChatMessageProps {
  message: AiMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={`max-w-[70%] rounded-xl px-3 py-2 text-sm leading-6 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <MarkdownMessage content={message.content} />
        )}
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
}
