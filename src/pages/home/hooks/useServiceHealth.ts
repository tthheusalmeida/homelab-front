import { useQuery } from "@tanstack/react-query";

import { checkService } from "../api/services";

export function useServiceHealth(url: string) {
  return useQuery({
    queryKey: ["service-health", url],
    queryFn: () => checkService(url),
    refetchInterval: 15_000,
    retry: false,
  });
}
