import type { ReactNode } from "react";
import { cn } from "#lib/utils";

export interface OverviewCardProps {
  label: string;
  value: string | number;
  description?: ReactNode;
  descriptionClassName?: string;
}

export function OverviewCard({
  label,
  value,
  description,
  descriptionClassName = "text-muted-foreground",
}: OverviewCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 select-none">
      <div className="text-sm text-muted-foreground">{label}</div>

      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>

      <div className={`mt-1 text-xs ${descriptionClassName}`}>
        {description && (
          <div
            className={cn(
              "text-xs text-muted-foreground",
              descriptionClassName,
            )}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
