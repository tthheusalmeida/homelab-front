import {
  type JobStatus,
  JobStatusOptions,
  type JobStepState,
  JobStepStateOptions,
  type JobStepType,
} from "../../types/job.types";

import { JobStep } from "./JobStep";

interface JobProcessingStepsProps {
  steps: JobStepType[];
}

function getStepState(status: JobStatus): JobStepState {
  switch (status) {
    case JobStatusOptions.COMPLETED:
      return JobStepStateOptions.COMPLETED;

    case JobStatusOptions.RUNNING:
      return JobStepStateOptions.ACTIVE;

    case JobStatusOptions.FAILED:
      return JobStepStateOptions.FAILED;

    default:
      return JobStepStateOptions.PENDING;
  }
}

export function JobProcessingSteps({ steps }: JobProcessingStepsProps) {
  return (
    <div className="ml-0.5 mt-1 flex flex-col items-start">
      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <JobStep
            small
            key={step.name}
            label={step.label}
            state={getStepState(step.status)}
          />
        ))}
      </div>
    </div>
  );
}
