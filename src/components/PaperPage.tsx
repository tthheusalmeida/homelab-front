import type { ReactNode } from "react";

import { cn } from "#lib/utils";

interface PaperPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Folha de leitura: usa as cores do tema (cartão sobre o fundo), margens
 * generosas, borda e sombra suaves e largura de leitura confortável.
 */
export function PaperPage({ children, className }: PaperPageProps) {
  return (
    <div
      data-slot="paper-page"
      className={cn(
        "mx-auto w-full max-w-3xl rounded-lg border bg-card px-6 py-8 text-card-foreground shadow-sm sm:px-12 sm:py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
