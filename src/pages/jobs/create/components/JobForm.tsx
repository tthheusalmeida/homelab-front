import { JobNameOptions, type JobType } from "../../types/job.types";

import { VideoTranscriptForm } from "./VideoTranscriptForm";

interface JobFormProps {
  jobType: JobType;
}

export function JobForm({ jobType }: JobFormProps) {
  switch (jobType.type) {
    case JobNameOptions.VIDEO_TRANSCRIPT:
      return <VideoTranscriptForm />;

    default:
      return null;
  }
}
