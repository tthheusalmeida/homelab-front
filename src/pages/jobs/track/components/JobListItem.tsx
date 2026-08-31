import type { Job } from "../types/job.types";

import { ChevronDown } from "lucide-react";

import { JobFlow } from "./JobFlow";
import { JobResult } from "./JobResult";
import { JobStatusBadge } from "./JobStatusBadge";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#ui/collapsible";
import { Card, CardContent, CardHeader } from "#ui/card";

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
    <Collapsible className="group">
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

            <div className="flex items-center gap-2">
              <JobStatusBadge status={job._status} />

              <CollapsibleTrigger className="rounded-md p-2 hover:bg-muted">
                <ChevronDown className="size-4 transition-transform duration-500 ease-in-out group-data-open:rotate-180" />
                <span className="sr-only">Expandir job</span>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {!job._error && <JobFlow status={job._status} />}

            <JobResult status={job._status} error={job._error} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
