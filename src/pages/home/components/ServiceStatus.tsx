import { cn } from "#lib/utils";

interface ServiceStatusProps {
  isLoading: boolean;
  isError: boolean;
}

export function ServiceStatus({ isLoading, isError }: ServiceStatusProps) {
  return (
    <span
      className={cn([
        "size-2 rounded-full",
        isLoading
          ? "animate-pulse bg-muted-foreground"
          : isError
            ? "bg-red-500"
            : "bg-emerald-500",
      ])}
    />
  );
}
