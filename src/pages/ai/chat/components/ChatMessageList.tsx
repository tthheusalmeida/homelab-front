import type { AiMessage } from "../types/chat";

import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
  messages: AiMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full flex-col gap-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
