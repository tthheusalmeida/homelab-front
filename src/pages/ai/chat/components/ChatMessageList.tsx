import { useEffect, useRef } from "react";

import type { AiMessage, ChatStatus } from "../types/chat";

import { ChatMessage } from "./ChatMessage";
import { LoadingState } from "#components/LoadingState";
import { ScrollArea } from "#ui/scroll-area";

interface ChatMessageListProps {
  messages: AiMessage[];
  status?: ChatStatus;
}

export function ChatMessageList({
  messages,
  status = "idle",
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, status]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto flex w-full flex-col gap-4 px-4 py-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {status === "sending" && <LoadingState message="Pensando" />}

        {status === "cancelled" && (
          <LoadingState message="Geração cancelada" loading={false} />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
