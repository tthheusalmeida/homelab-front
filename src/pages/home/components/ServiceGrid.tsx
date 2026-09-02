import { services, type HealthCheckStatus } from "../types/services.types";
import { ServiceCard } from "./ServiceCard";

interface ServiceGridProps {
  queries: {
    data?: {
      service: string;
      description: string;
      checks: {
        service: string;
        description: string;
        status: HealthCheckStatus;
      }[];
    };
    isLoading: boolean;
  }[];
}

export function ServiceGrid({ queries }: ServiceGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service, index) => {
        const query = queries[index];

        return (
          <ServiceCard
            key={service.name}
            service={service}
            health={query.data}
            isLoading={query.isLoading}
          />
        );
      })}
    </div>
  );
}
