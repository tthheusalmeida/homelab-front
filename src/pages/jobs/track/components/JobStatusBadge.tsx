import { Check, Circle, Loader2, X } from "lucide-react";

import { Badge } from "../../../../ui/badge";

import { type JobStatus, JobStatusOptions } from "../types/job.types";

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
    icon: Loader2,
  },
  [JobStatusOptions.COMPLETED]: {
    label: "Concluído",
    icon: Check,
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
  }
>;

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={status === JobStatusOptions.FAILED ? "destructive" : "secondary"}
    >
      <Icon
        className={status === JobStatusOptions.RUNNING ? "animate-spin" : ""}
      />
      {config.label}
    </Badge>
  );
}
