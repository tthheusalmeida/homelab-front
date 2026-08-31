import { useMutation } from "@tanstack/react-query";

import { createVideoTranscript } from "../api/create";

export function useCreateVideoTranscript() {
  return useMutation({
    mutationFn: createVideoTranscript,
  });
}
