import { api } from "#lib/api";

import type { AiUsageParams, AiUsageResponse } from "../types/aiUsage.types";

export async function getAiUsage(
  params: AiUsageParams,
): Promise<AiUsageResponse> {
  const searchParams = new URLSearchParams();

  if (params.from) {
    searchParams.set("from", params.from);
  }

  if (params.to) {
    searchParams.set("to", params.to);
  }

  if (params.provider) {
    searchParams.set("provider", params.provider);
  }

  const query = searchParams.toString();

  return api<AiUsageResponse>(`/ai/usage${query ? `?${query}` : ""}`);
}
