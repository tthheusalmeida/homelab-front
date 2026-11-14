import { Trophy } from "lucide-react";

import { Button } from "#ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#ui/dialog";

import { formatReadingTime } from "../stats";

interface BookCompletedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  chapters: number;
  words: number;
  /** Tempo de leitura estimado, em minutos. */
  minutes: number;
}

const CONFETTI_COLORS = [
  "bg-amber-400",
  "bg-rose-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
];

/** Pedacinhos de confete que caem (só CSS; ver `confetti-fall` em global.css). */
const confetti = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${((index * 13) % 10) / 10}s`,
  duration: `${2.2 + ((index * 7) % 10) / 10}s`,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

/**
 * Comemoração ao ler o último capítulo do livro, com troféu e confete:
 * troféu dourado, confete e os números da leitura.
 */
export function BookCompletedDialog({
  open,
  onOpenChange,
  title,
  chapters,
  words,
  minutes,
}: BookCompletedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {confetti.map((piece, index) => (
            <span
              key={index}
              className={`absolute -top-3 h-3 w-1.5 rounded-sm ${piece.color}`}
              style={{
                left: piece.left,
                animation: `confetti-fall ${piece.duration} ${piece.delay} ease-in infinite`,
              }}
            />
          ))}
        </div>

        <DialogHeader className="relative items-center gap-3">
          <div className="flex size-20 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-[0_0_32px_rgb(251_191_36/0.6)]">
            <Trophy className="size-10" />
          </div>

          <DialogTitle className="text-2xl">Livro concluído!</DialogTitle>

          <DialogDescription>
            Você leu todos os capítulos de “{title}”.
          </DialogDescription>
        </DialogHeader>

        <dl className="relative grid grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">Capítulos</dt>

            <dd className="text-lg font-semibold">{chapters}</dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">Palavras</dt>

            <dd className="text-lg font-semibold">
              {words.toLocaleString("pt-BR")}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-muted-foreground">Leitura</dt>

            <dd className="text-lg font-semibold">
              {formatReadingTime(minutes)}
            </dd>
          </div>
        </dl>

        <DialogFooter className="relative sm:justify-center">
          <Button onClick={() => onOpenChange(false)}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
