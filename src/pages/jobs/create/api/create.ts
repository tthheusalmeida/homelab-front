import { api } from "#lib/api";

import type { JobType } from "../../types/job.types";
import type { DocumentHints } from "../hints";
import type { SummaryDetail } from "../summary-detail";

export interface CreateVideoToTranscriptParams extends DocumentHints {
  url: string;
}

export interface CreateVideoToSummaryParams extends DocumentHints {
  url: string;
  providerId: string;
  modelId: string;
  thinking: string;
  detail: SummaryDetail;
}

export async function getJobTypes(): Promise<JobType[]> {
  const response = await api<JobType[]>("/jobs/types");

  return response;
}

export async function createVideoToTranscript(
  params: CreateVideoToTranscriptParams,
) {
  return await api<{ id: string; status: string }>(
    "/jobs/video-to-transcript",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
}

export async function createVideoToSummary(params: CreateVideoToSummaryParams) {
  return await api<{ id: string; status: string }>("/jobs/video-to-summary", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
