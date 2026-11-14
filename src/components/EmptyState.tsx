import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
      {Icon && (
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}

      <p className="text-sm font-semibold">{title}</p>

      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}

      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
