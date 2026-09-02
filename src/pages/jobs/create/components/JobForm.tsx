import { JobNameOptions, type JobType } from "../../types/job.types";
import { VideoToSummaryForm } from "./VideoToSummaryForm";

import { VideoToTranscriptForm } from "./VideoToTranscriptForm";

interface JobFormProps {
  jobType: JobType;
}

export function JobForm({ jobType }: JobFormProps) {
  switch (jobType.type) {
    case JobNameOptions.VIDEO_TO_TRANSCRIPT:
      return <VideoToTranscriptForm />;
    case JobNameOptions.VIDEO_TO_SUMMARY:
      return <VideoToSummaryForm />;

    default:
      return null;
  }
}
