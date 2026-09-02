import { useMutation } from "@tanstack/react-query";

import { createVideoToSummary } from "../api/create";

export function useCreateVideoToSummary() {
  return useMutation({
    mutationFn: createVideoToSummary,
  });
}
