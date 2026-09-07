import { Check, Circle, Loader, X } from "lucide-react";

import { cn } from "../../../../lib/utils";

import { type JobStepState, JobStepStateOptions } from "../../types/job.types";

interface JobStepProps {
  label: string;
  state: JobStepState;
  small?: boolean;
}

const stateConfig: Record<JobStepState, { icon: typeof Circle }> = {
  [JobStepStateOptions.PENDING]: {
    icon: Circle,
  },

  [JobStepStateOptions.ACTIVE]: {
    icon: Loader,
  },

  [JobStepStateOptions.COMPLETED]: {
    icon: Check,
  },

  [JobStepStateOptions.FAILED]: {
    icon: X,
  },
};

export function JobStep({ label, state, small }: JobStepProps) {
  const Icon = stateConfig[state].icon;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={cn(
          small ? "size-4" : "size-5",
          "flex shrink-0 items-center justify-center rounded-full border",
          state === JobStepStateOptions.ACTIVE && "border-primary text-primary",
          state === JobStepStateOptions.COMPLETED &&
            "bg-emerald-800 text-emerald-300",
          state === JobStepStateOptions.FAILED &&
            "border-destructive bg-destructive text-destructive-foreground",
          state === JobStepStateOptions.PENDING && "text-muted-foreground",
        )}
      >
        <Icon
          className={cn(
            small ? "size-2.5 stroke-2.5" : "size-3 stroke-3",
            state === JobStepStateOptions.ACTIVE &&
              "animate-spin animation-duration-[2s]",
          )}
        />
      </div>

      <span
        className={cn(
          small ? "text-xs font-mono" : "text-sm",
          state === JobStepStateOptions.PENDING && "text-muted-foreground",
          state === JobStepStateOptions.ACTIVE && "font-medium",
        )}
      >
        {label}
      </span>
    </div>
  );
}
