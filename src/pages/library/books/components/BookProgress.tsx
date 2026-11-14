import { Trophy } from "lucide-react";

import { formatDate } from "#lib/format";
import { cn } from "#lib/utils";

interface BookProgressProps {
  /** Capítulos lidos. */
  read: number;
  /** Capítulos disponíveis para ler. */
  total: number;
  /** Livro concluído (todos lidos): a barra fica dourada. */
  completed?: boolean;
  /** Quando foi concluído; com ele, o texto diz a data em vez de "Livro concluído". */
  completedAt?: string | null;
  className?: string;
}

/** Barra de progresso de leitura com "X de Y capítulos lidos". */
export function BookProgress({
  read,
  total,
  completed = false,
  completedAt,
  className,
}: BookProgressProps) {
  if (total <= 0) {
    return null;
  }

  const percent = Math.round((Math.min(read, total) / total) * 100);

  return (
    <div className={cn("space-y-0.5", className)}>
      <div
        role="progressbar"
        aria-label="Progresso de leitura"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(read, total)}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            completed ? "bg-amber-400" : "bg-primary",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p
        className={cn(
          "flex items-center justify-center gap-1 text-xs leading-4",
          completed ? "font-semibold text-amber-500" : "text-muted-foreground",
        )}
      >
        {completed && <Trophy className="size-3.5" />}
        {completed
          ? completedAt
            ? `Concluído em ${formatDate(completedAt)}`
            : "Livro concluído"
          : `${read} de ${total} capítulo(s) lidos · ${percent}%`}
      </p>
    </div>
  );
}
