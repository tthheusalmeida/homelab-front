export interface AiUsageParams {
  from?: string;
  to?: string;
  provider?: string;
}

export interface AiUsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  averageLatencyMs: number;
}

export interface AiProviderUsage {
  provider: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  averageLatencyMs: number;
}

export interface AiModelUsage {
  provider: string;
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  averageLatencyMs: number;
}

export interface AiUsageTimeline {
  date: string;
  requests: number;
  tokens: number;
  estimatedCost: number;
}

export interface AiUsageRequest {
  id: string;
  provider: string;
  model: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  latencyMs: number;
  success: boolean;
  createdAt: string;
}

export interface AiUsageResponse {
  summary: AiUsageSummary;
  byProvider: AiProviderUsage[];
  byModel: AiModelUsage[];
  timeline: AiUsageTimeline[];
  recentRequests: AiUsageRequest[];
}
