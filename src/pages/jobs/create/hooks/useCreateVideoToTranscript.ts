import { useMutation } from "@tanstack/react-query";

import { createVideoToTranscript } from "../api/create";

export function useCreateVideoToTranscript() {
  return useMutation({
    mutationFn: createVideoToTranscript,
  });
}
