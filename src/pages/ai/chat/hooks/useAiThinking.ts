import { useQuery } from "@tanstack/react-query";

import { getAiThinkingOptions } from "../api/chat";

interface UseAiThinkingParams {
  providerId?: string;
  modelId?: string;
}

export function useAiThinking({ providerId, modelId }: UseAiThinkingParams) {
  return useQuery({
    queryKey: ["ai", "thinking", providerId, modelId],
    queryFn: () => getAiThinkingOptions(providerId!, modelId!),
    enabled: Boolean(providerId && modelId),
  });
}
