import { useRef, useState } from "react";

import { api } from "#lib/api";

import type { AiChatRequest, AiChatRequestMessage } from "../types/chat";

export function useAiChat() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(
    data: AiChatRequest,
  ): Promise<AiChatRequestMessage> {
    abortControllerRef.current?.abort();

    const controller = new AbortController();

    abortControllerRef.current = controller;
    setIsSending(true);

    try {
      return await api<AiChatRequest>("/chat", {
        method: "POST",
        body: JSON.stringify(data),
        signal: controller.signal,
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsSending(false);
      }
    }
  }

  function abort() {
    abortControllerRef.current?.abort();
  }

  return {
    sendMessage,
    abort,
    isSending,
  };
}
