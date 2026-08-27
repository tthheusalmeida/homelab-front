import { useQuery } from "@tanstack/react-query";

import { getAiUsage } from "../api/getAiUsage";
import type { AiUsageParams } from "../types/aiUsage.types";

export function useAiUsage(params: AiUsageParams = {}) {
  return useQuery({
    queryKey: ["ai-usage", params],
    queryFn: () => getAiUsage(params),
    staleTime: 30_000,
  });
}
