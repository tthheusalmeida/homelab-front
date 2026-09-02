import { useQueries } from "@tanstack/react-query";

import { checkService } from "../api/services";
import { services } from "../types/services.types";

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

  const healthServices = queries
    .map((query) => query.data)
    .filter((data): data is NonNullable<typeof data> => !!data);

  const checks = healthServices.flatMap((service) => service.checks);
  const online = checks.filter((check) => check.status === "ok").length;
  const offline = checks.filter((check) => check.status === "error").length;
  const total = checks.length;

  return {
    queries,
    services: healthServices,
    isLoading,
    online,
    offline,
    total,
    allOnline: total > 0 && online === total,
    allOffline: total > 0 && offline === total,
    hasOffline: offline > 0,
  };
}
