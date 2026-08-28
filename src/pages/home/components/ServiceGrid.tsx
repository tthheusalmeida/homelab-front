import { services } from "../types/services.types";
import { ServiceCard } from "./ServiceCard";

interface ServiceGridProps {
  queries: {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }[];
}

export function ServiceGrid({ queries }: ServiceGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const query = queries[index];

        return (
          <ServiceCard
            key={service.name}
            service={service}
            isLoading={query.isLoading}
            isOnline={query.isSuccess}
          />
        );
      })}
    </div>
  );
}
