import { useMutation } from "@tanstack/react-query";

import { createVideoTranscript } from "../api/create";

export function useCreateVideoToTranscript() {
  return useMutation({
    mutationFn: createVideoTranscript,
  });
}
