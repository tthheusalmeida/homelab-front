import { useEffect, type ReactNode } from "react";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "#ui/button";

interface ReadingModeProps {
  /** Título mostrado na barra de cima (o que está sendo lido). */
  title: string;
  /** Sumário que fica na lateral. */
  toc: ReactNode;
  /** Controles na barra de cima (ex.: busca no texto). */
  actions?: ReactNode;
  /** O texto a ler. */
  children: ReactNode;
  onExit: () => void;
}

/**
 * Modo leitura: cobre a tela com só o texto e o sumário na lateral (sem
 * botões de ação nem cabeçalhos da página). Esc sai. O texto é desenhado só
 * aqui, nunca junto com a página normal, para não repetir ids de título.
 */
export function ReadingMode({
  title,
  toc,
  actions,
  children,
  onExit,
}: ReadingModeProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onExit();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [onExit]);

  return createPortal(
    <div
      role="region"
      aria-label="Modo leitura"
      className="fixed inset-0 z-50 overflow-y-auto bg-background"
    >
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-background px-4">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>

        {actions && <div className="w-full max-w-sm">{actions}</div>}

        <Button variant="outline" size="sm" onClick={onExit}>
          <X /> Sair do modo leitura
        </Button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">{children}</div>

        <aside
          aria-label="Sumário da leitura"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          {toc}
        </aside>
      </div>
    </div>,
    document.body,
  );
}
