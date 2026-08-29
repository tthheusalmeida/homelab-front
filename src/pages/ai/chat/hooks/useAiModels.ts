import { useQuery } from "@tanstack/react-query";

import { getAiModels } from "../api/chat";

export function useAiModels(providerId?: string) {
  return useQuery({
    queryKey: ["ai", "models", providerId],
    queryFn: () => getAiModels(providerId!),
    enabled: Boolean(providerId),
  });
}
