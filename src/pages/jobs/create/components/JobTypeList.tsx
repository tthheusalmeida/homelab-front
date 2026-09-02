import type { JobType } from "../../types/job.types";

import { JobTypeCard } from "./JobTypeCard";

interface JobTypeListProps {
  jobTypes: JobType[];
  onSelect: (jobType: JobType) => void;
}

export function JobTypeList({ jobTypes, onSelect }: JobTypeListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {jobTypes.map((jobType) => (
        <JobTypeCard key={jobType.type} jobType={jobType} onSelect={onSelect} />
      ))}
    </div>
  );
}
