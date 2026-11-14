import { JobNameOptions, type JobType } from "../../types/job.types";
import { VideoToSummaryForm } from "./VideoToSummaryForm";

import { VideoToTranscriptForm } from "./VideoToTranscriptForm";

interface JobFormProps {
  jobType: JobType;
  /** Chamado quando o job foi criado. */
  onCreated?: () => void;
}

export function JobForm({ jobType, onCreated }: JobFormProps) {
  switch (jobType.type) {
    case JobNameOptions.VIDEO_TO_TRANSCRIPT:
      return <VideoToTranscriptForm onCreated={onCreated} />;
    case JobNameOptions.VIDEO_TO_SUMMARY:
      return <VideoToSummaryForm onCreated={onCreated} />;

    default:
      return null;
  }
}
