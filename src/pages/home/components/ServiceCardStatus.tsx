import { cn } from "#lib/utils";

interface ServiceCardStatusProps {
  isLoading: boolean;
  isOnline: boolean;
}

export default function ServiceCardStatus({
  isLoading,
  isOnline,
}: ServiceCardStatusProps) {
  const statusClass = isLoading
    ? "bg-muted-foreground"
    : isOnline
      ? "bg-emerald-500"
      : "bg-red-700";

  const shouldAnimate = isLoading || isOnline;

  return (
    <span className="relative flex size-2">
      <span
        className={cn(
          "absolute inline-flex size-full rounded-full opacity-75",
          shouldAnimate && "animate-ping",
          statusClass,
        )}
      />

      <span
        className={cn("relative inline-flex size-2 rounded-full", statusClass)}
      />
    </span>
  );
}
