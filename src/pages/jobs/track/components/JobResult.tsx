import { XCircle } from "lucide-react";

import { cn } from "../../../../lib/utils";

import { type JobStatus, JobStatusOptions } from "../types/job.types";

interface JobResultProps {
  status: JobStatus;
  error?: string;
}

export function JobResult({ status, error }: JobResultProps) {
  if (status === JobStatusOptions.FAILED) {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border border-destructive/30",
          "bg-destructive/5 p-2",
        )}
      >
        <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />

        <div className="min-w-0">
          <p className="font-medium text-destructive">Falha no processamento</p>

          {error && (
            <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === JobStatusOptions.COMPLETED) return;

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">Trabalhando...</p>
    </div>
  );
}
