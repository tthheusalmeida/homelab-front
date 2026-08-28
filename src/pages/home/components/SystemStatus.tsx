import { cn } from "#lib/utils";

interface SystemStatusProps {
  isLoading: boolean;
  allOnline: boolean;
  allOffline: boolean;
}

export function SystemStatus({
  isLoading,
  allOnline,
  allOffline,
}: SystemStatusProps) {
  const status = isLoading
    ? {
        color: "bg-muted-foreground",
        label: "Verificando",
      }
    : allOnline
      ? {
          color: "bg-emerald-500",
          label: "Todos os sistemas operacionais",
        }
      : allOffline
        ? {
            color: "bg-red-500",
            label: "TODOS OS SISTEMAS FORA DO AR",
          }
        : {
            color: "bg-amber-500",
            label: "Alguns sistemas estão fora do ar",
          };

  return (
    <span className="mt-1 flex items-center gap-1 text-foreground">
      <span
        className={cn(
          [
            "size-2 rounded-full",
            isLoading && "animate-pulse",
            status.color,
          ].filter(Boolean),
        )}
      />

      <span>{status.label}</span>
    </span>
  );
}
