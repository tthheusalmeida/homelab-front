import { Check, Circle, Loader, X } from "lucide-react";

import { Badge } from "../../../../ui/badge";

import { type JobStatus, JobStatusOptions } from "../types/job.types";
import { cn } from "#lib/utils";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const statusConfig = {
  [JobStatusOptions.PENDING]: {
    label: "Pendente",
    icon: Circle,
  },
  [JobStatusOptions.RUNNING]: {
    label: "Em execução",
    icon: Loader,
  },
  [JobStatusOptions.COMPLETED]: {
    label: "Concluído",
    icon: Check,
    className: "bg-emerald-800 text-emerald-300",
  },
  [JobStatusOptions.FAILED]: {
    label: "Falhou",
    icon: X,
  },
} satisfies Record<
  JobStatus,
  {
    label: string;
    icon: typeof Circle;
    className?: string;
  }
>;

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={status === JobStatusOptions.FAILED ? "destructive" : "secondary"}
      className={cn(config.className, "min-w-24")}
    >
      <Icon
        className={cn(
          status === JobStatusOptions.RUNNING &&
            "animate-spin animation-duration-[2s]",
          "size-3 stroke-3",
        )}
      />
      {config.label}
    </Badge>
  );
}
