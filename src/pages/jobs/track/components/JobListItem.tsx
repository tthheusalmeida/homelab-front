import { Card, CardContent, CardHeader } from "../../../../ui/card";

import type { Job } from "../types/job.types";

import { JobFlow } from "./JobFlow";
import { JobResult } from "./JobResult";
import { JobStatusBadge } from "./JobStatusBadge";

interface JobListItemProps {
  job: Job;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export function JobListItem({ job }: JobListItemProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-muted-foreground">
              {job.id}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Criado em {formatDate(job.createdAt)}
            </p>
          </div>

          <JobStatusBadge status={job._status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <JobFlow status={job._status} />

        <JobResult status={job._status} error={job._error} />
      </CardContent>
    </Card>
  );
}
