import { useQueries } from "@tanstack/react-query";

import { checkService } from "../api/services";
import { services } from "../types/services.types";

export interface SystemHealth {
  isLoading: boolean;
  online: number;
  offline: number;
  total: number;
  allOnline: boolean;
  allOffline: boolean;
  hasOffline: boolean;
}

export function useSystemHealth() {
  const queries = useQueries({
    queries: services.map((service) => ({
      queryKey: ["service-health", service.name],
      queryFn: () => checkService(service.healthUrl),
      refetchInterval: 15_000,
      retry: false,
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const online = queries.filter((query) => query.isSuccess).length;
  const offline = queries.filter((query) => query.isError).length;

  return {
    queries,
    isLoading,
    online,
    offline,
    total: services.length,
    allOnline: online === services.length,
    allOffline: offline === services.length,
    hasOffline: offline > 0,
  };
}
