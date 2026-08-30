import { Check, Circle, Loader2, X } from "lucide-react";

import { cn } from "../../../../lib/utils";

import { type JobStepState, JobStepStateOptions } from "../types/job.types";

interface JobStepProps {
  label: string;
  state: JobStepState;
}

const stateConfig: Record<JobStepState, { icon: typeof Circle }> = {
  [JobStepStateOptions.PENDING]: {
    icon: Circle,
  },

  [JobStepStateOptions.ACTIVE]: {
    icon: Loader2,
  },

  [JobStepStateOptions.COMPLETED]: {
    icon: Check,
  },

  [JobStepStateOptions.FAILED]: {
    icon: X,
  },
};

export function JobStep({ label, state }: JobStepProps) {
  const Icon = stateConfig[state].icon;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border",
          state === JobStepStateOptions.ACTIVE && "border-primary text-primary",
          state === JobStepStateOptions.COMPLETED &&
            "border-emerald-500 bg-emerald-500 text-white",
          state === JobStepStateOptions.FAILED &&
            "border-destructive bg-destructive text-destructive-foreground",
          state === JobStepStateOptions.PENDING && "text-muted-foreground",
        )}
      >
        <Icon
          className={cn(
            "size-4",
            state === JobStepStateOptions.ACTIVE && "animate-spin",
          )}
        />
      </div>

      <span
        className={cn(
          "text-sm",

          state === JobStepStateOptions.PENDING && "text-muted-foreground",

          state === JobStepStateOptions.ACTIVE && "font-medium",
        )}
      >
        {label}
      </span>
    </div>
  );
}
