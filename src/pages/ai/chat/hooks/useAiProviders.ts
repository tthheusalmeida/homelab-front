import { useQuery } from "@tanstack/react-query";

import { getAiProviders } from "../api/chat";

export function useAiProviders() {
  return useQuery({
    queryKey: ["ai", "providers"],
    queryFn: getAiProviders,
  });
}
