import { api } from "#lib/api";

import type { Job } from "../../types/job.types";

export async function fetchJobs(): Promise<Job[]> {
  return api<Job[]>("/jobs");
}
