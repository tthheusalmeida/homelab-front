import {
  type JobStatus,
  JobStatusOptions,
  type JobStepState,
  JobStepStateOptions,
} from "../types/job.types";

import { JobStep } from "./JobStep";

interface JobFlowProps {
  status: JobStatus;
}

const steps = [
  {
    label: "Pendente",
    status: JobStatusOptions.PENDING,
  },
  {
    label: "Processando",
    status: JobStatusOptions.RUNNING,
  },
  {
    label: "Concluído",
    status: JobStatusOptions.COMPLETED,
  },
];

function getStepState(
  currentStatus: JobStatus,
  stepStatus: JobStatus,
): JobStepState {
  if (currentStatus === JobStatusOptions.COMPLETED) {
    return JobStepStateOptions.COMPLETED;
  }

  if (currentStatus === JobStatusOptions.FAILED) {
    return JobStepStateOptions.FAILED;
  }

  if (currentStatus === stepStatus) {
    return JobStepStateOptions.ACTIVE;
  }

  const currentIndex = steps.findIndex((step) => step.status === currentStatus);

  const stepIndex = steps.findIndex((step) => step.status === stepStatus);

  if (stepIndex < currentIndex) {
    return JobStepStateOptions.COMPLETED;
  }

  return JobStepStateOptions.PENDING;
}

export function JobFlow({ status }: JobFlowProps) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((step, index) => (
        <div
          key={step.status}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <JobStep
            label={step.label}
            state={getStepState(status, step.status)}
          />

          {index < steps.length - 1 && (
            <div className="h-px flex-1 bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}
