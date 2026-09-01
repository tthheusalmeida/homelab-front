import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "#ui/card";
import { Button } from "#ui/button";

import type { JobType } from "../../types/job.types";

interface JobTypeCardProps {
  jobType: JobType;
  onSelect: (jobType: JobType) => void;
}

export function JobTypeCard({ jobType, onSelect }: JobTypeCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="font-medium">{jobType.label}</h2>

          <p className="text-sm text-muted-foreground">{jobType.description}</p>
        </div>

        <Button onClick={() => onSelect(jobType)} className="self-end-safe">
          Criar
          <ArrowRight />
        </Button>
      </CardContent>
    </Card>
  );
}
