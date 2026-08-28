import type { Service } from "../types/services.types";
import ServiceCardStatus from "./ServiceCardStatus";

interface ServiceCardInfoProps {
  service: Service;
}

export default function ServiceCardInfo({ service }: ServiceCardInfoProps) {
  return (
    <div className="min-w-0 select-none">
      <div className="flex items-center gap-2">
        <ServiceCardStatus isLoading={false} isOnline={false} />

        <span className="font-medium">{service.name}</span>
      </div>

      <p className="mt-1 truncate pl-4 text-xs text-muted-foreground">
        {service.description}
      </p>
    </div>
  );
}
