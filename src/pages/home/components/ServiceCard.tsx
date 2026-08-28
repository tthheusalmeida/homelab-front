import { ArrowRight } from "lucide-react";

import type { Service } from "../types/services.types";
import ServiceCardStatus from "./ServiceCardStatus";

interface ServiceCardProps {
  service: Service;
  isLoading: boolean;
  isOnline: boolean;
}

export function ServiceCard({
  service,
  isLoading,
  isOnline,
}: ServiceCardProps) {
  return (
    <a
      href={service.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0 select-none">
        <div className="flex items-center gap-2">
          <ServiceCardStatus isLoading={isLoading} isOnline={isOnline} />

          <span className="font-medium">{service.name}</span>
        </div>

        <p className="mt-1 truncate pl-4 text-xs text-muted-foreground">
          {service.description}
        </p>
      </div>

      <span className="ml-4 shrink-0 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        <ArrowRight className="size-4" />
      </span>
    </a>
  );
}
