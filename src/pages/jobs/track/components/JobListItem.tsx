import type { Job } from "../types/job.types";

import { ChevronDown, Timer } from "lucide-react";

import { JobFlow } from "./JobFlow";
import { JobResult } from "./JobResult";
import { JobStatusBadge } from "./JobStatusBadge";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ui/collapsible";

import { Card, CardContent, CardHeader } from "#ui/card";

import { JobNameLabels } from "../types/job.types";
import { Badge } from "#ui/badge";

interface JobListItemProps {
  job: Job;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatDuration(startedAt?: string, completedAt?: string) {
  if (!startedAt || !completedAt) {
    return null;
  }

  const duration =
    new Date(completedAt).getTime() - new Date(startedAt).getTime();

  const seconds = Math.floor(duration / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}min ${remainingSeconds}s`;
}

export function JobListItem({ job }: JobListItemProps) {
  const duration = formatDuration(job.startedAt, job.completedAt);

  return (
    <Collapsible className="group">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {JobNameLabels[job.name] ?? job.name}
                </p>

                {duration && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 gap-1 animate-in fade-in-0 slide-in-from-left-2 duration-400"
                  >
                    <Timer className="size-3.5" />
                    {duration}
                  </Badge>
                )}
              </div>

              <p className="mt-1 truncate font-mono text-xs text-muted-foreground/70">
                {job.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end gap-1">
                <JobStatusBadge status={job.status} />

                <p className="text-xs text-muted-foreground">
                  Criado em {formatDate(job.createdAt)}
                </p>
              </div>

              <CollapsibleTrigger className="rounded-md p-2 hover:bg-muted">
                <ChevronDown className="size-4 transition-transform duration-500 ease-in-out group-data-open:rotate-180" />

                <span className="sr-only">Expandir job</span>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!job.error && <JobFlow status={job.status} />}

            <JobResult status={job.status} error={job.error} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
