import { ArrowRight } from "lucide-react";

import type { HealthService, Service } from "../types/services.types";

import ServiceCardStatus from "./ServiceCardStatus";
import { formatServiceName } from "#lib/format";

interface ServiceCardProps {
  service: Service;
  health?: HealthService;
  isLoading: boolean;
}

export function ServiceCard({ service, health, isLoading }: ServiceCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 select-none">
          <div className="flex items-center gap-2">
            <ServiceCardStatus
              isLoading={isLoading}
              isOnline={
                health?.checks.every((check) => check.status === "ok") ?? false
              }
            />

            <span className="font-medium">{service.name}</span>
          </div>

          <p className="mt-1 pl-4 text-xs text-muted-foreground">
            {health?.description ?? service.description}
          </p>
        </div>

        <a
          href={service.url}
          target="_blank"
          rel="noreferrer"
          className="ml-4 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-3">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">
            Verificando serviços...
          </div>
        ) : (
          health?.checks.map((check) => (
            <div
              key={check.service}
              className="flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="text-sm">
                  {formatServiceName(check.service)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {check.description}
                </div>
              </div>

              <ServiceCardStatus
                isLoading={false}
                isOnline={check.status === "ok"}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
