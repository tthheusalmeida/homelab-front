import { api } from "#lib/api";

import type { AiModel, AiProvider, AiThinkingOption } from "../types/chat";

export function getAiProviders() {
  return api<AiProvider[]>("/ai/providers");
}

export function getAiModels(providerId: string) {
  return api<AiModel[]>(`/ai/providers/${providerId}/models`);
}

export function getAiThinkingOptions(providerId: string, modelId: string) {
  const params = new URLSearchParams({
    providerId,
    modelId,
  });

  return api<AiThinkingOption[]>(`/ai/thinking?${params.toString()}`);
}
