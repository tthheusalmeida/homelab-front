export const JobStatusOptions: Record<string, string> = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const JobStepStateOptions: Record<string, string> = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type JobStatus =
  (typeof JobStatusOptions)[keyof typeof JobStatusOptions];

export type JobStepState =
  (typeof JobStepStateOptions)[keyof typeof JobStepStateOptions];

export interface Job {
  id: string;
  createdAt: string;
  _status: JobStatus;
  _startedAt?: string;
  _error?: string;
}
