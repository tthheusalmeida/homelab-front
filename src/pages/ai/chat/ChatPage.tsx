import { useState } from "react";

import type { AiMessage } from "./types/chat";

import { useAiModels } from "./hooks/useAiModels";
import { useAiProviders } from "./hooks/useAiProviders";
import { useAiThinking } from "./hooks/useAiThinking";
import { useAiChat } from "./hooks/useAiChat";

import { ChatEmptyState } from "./components/ChatEmptyState";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatComposer } from "./components/ChatComposer";
import { ChatSettings } from "./components/ChatSettings";

export function ChatPage() {
  const [providerId, setProviderId] = useState<string | undefined>(undefined);
  const [modelId, setModelId] = useState<string | undefined>(undefined);
  const [thinkingId, setThinkingId] = useState<string | undefined>(undefined);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AiMessage[]>([]);

  const { sendMessage, abort, isSending } = useAiChat();

  const providersQuery = useAiProviders();

  const activeProviderId = providerId ?? providersQuery.data?.[0]?.id;
  const modelsQuery = useAiModels(activeProviderId);

  const activeModelId = modelId ?? modelsQuery.data?.[0]?.id;
  const thinkingQuery = useAiThinking({
    providerId: activeProviderId,
    modelId: activeModelId,
  });

  const activeThinkingId = thinkingId ?? thinkingQuery.data?.[0]?.id;

  function handleProviderChange(value: string | null) {
    setProviderId(value ?? undefined);
    setModelId(undefined);
    setThinkingId(undefined);
  }

  function handleModelChange(value: string | null) {
    setModelId(value ?? undefined);
    setThinkingId(undefined);
  }

  function handleThinkingChange(value: string | null) {
    setThinkingId(value ?? undefined);
  }

  async function handleSend() {
    if (isSending) {
      abort();
      return;
    }

    const content = message.trim();
    if (!content) {
      return;
    }

    if (!activeProviderId || !activeModelId || !activeThinkingId) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
    setMessage("");

    try {
      const response = await sendMessage({
        providerId: activeProviderId,
        modelId: activeModelId,
        thinkingId: activeThinkingId,
        message: content,
      });

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.message,
        },
      ]);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("Failed to send AI message:", error);
    }
  }

  const isLoading =
    providersQuery.isLoading ||
    modelsQuery.isLoading ||
    thinkingQuery.isLoading;

  const canSend =
    Boolean(message.trim()) &&
    Boolean(activeProviderId) &&
    Boolean(activeModelId) &&
    Boolean(activeThinkingId) &&
    !isLoading;

  return (
    <div className="flex max-h-[90dvh] flex-1 flex-col">
      {messages.length ? (
        <ChatMessageList messages={messages} />
      ) : (
        <ChatEmptyState />
      )}

      <ChatComposer
        value={message}
        onChange={setMessage}
        onSend={handleSend}
        disabled={!canSend}
        settings={
          <ChatSettings
            providers={providersQuery.data ?? []}
            models={modelsQuery.data ?? []}
            thinkingOptions={thinkingQuery.data ?? []}
            providerId={activeProviderId}
            modelId={activeModelId}
            thinkingId={activeThinkingId}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onThinkingChange={handleThinkingChange}
            isLoadingModels={modelsQuery.isLoading}
            isLoadingThinking={thinkingQuery.isLoading}
          />
        }
      />
    </div>
  );
}
