import { api } from "#lib/api";

import type { JobType } from "../../types/job.types";

export async function getJobTypes(): Promise<JobType[]> {
  const response = await api<JobType[]>("/jobs/types");

  return response;
}

export async function createVideoTranscript(url: string) {
  return await api<{ id: string; status: string }>(
    "/jobs/video-to-transcript",
    {
      method: "POST",
      body: JSON.stringify({ url }),
    },
  );
}
