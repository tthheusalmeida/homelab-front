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

export const JobNameOptions = {
  VIDEO_TRANSCRIPT: "video-transcript",
} as const;

export type JobStatus =
  (typeof JobStatusOptions)[keyof typeof JobStatusOptions];

export type JobStepState =
  (typeof JobStepStateOptions)[keyof typeof JobStepStateOptions];

export type JobName = (typeof JobNameOptions)[keyof typeof JobNameOptions];

export interface Job {
  completedAt: string;
  createdAt: string;
  id: string;
  name: string;
  label: string;
  startedAt?: string;
  status: JobStatus;
  error?: string;
}

export interface JobType {
  type: string;
  label: string;
  description: string;
}
