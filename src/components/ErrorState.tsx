import { Button } from "#ui/button";
import { CircleAlert, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  primaryMessage: string;
  secondaryMessage?: string;
  actionLabel?: string;
  action?: () => void;
}

export function ErrorState({
  primaryMessage,
  secondaryMessage,
  actionLabel = "Tentar novamente",
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-red-500">
        <CircleAlert className="size-6 text-white" />
      </div>

      <p className="text-sm font-semibold text-primary mt-2">
        {primaryMessage}
      </p>
      {secondaryMessage && (
        <p className="text-sm font-light text-muted-foreground">
          {secondaryMessage}
        </p>
      )}

      {action && (
        <Button variant="secondary" onClick={action} className="mt-4">
          <RefreshCcw /> {actionLabel}
        </Button>
      )}
    </div>
  );
}
