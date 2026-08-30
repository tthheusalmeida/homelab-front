import type { AIProviderName } from "./ai.types";

export interface AiUsageParams {
  provider?: string;
}

export interface AiUsageSummary {
  totalRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  averageLatencyMs: number;
}

export interface AiProviderUsage {
  provider: AIProviderName;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  averageLatencyMs: number;
}

export interface AiModelUsage {
  provider: AIProviderName;
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
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface AiUsageRequest {
  id: string;
  provider: AIProviderName;
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
