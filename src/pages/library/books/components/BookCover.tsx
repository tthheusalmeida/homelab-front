import { useState } from "react";

import { Trophy } from "lucide-react";

import { cn } from "#lib/utils";

import { gradientOf } from "../cover";
import { bookKindLabels, type BookCoverColor, type BookKind } from "../types";

interface BookCoverProps {
  title: string;
  kind: BookKind;
  subtitle?: string;
  color?: BookCoverColor;
  /** Imagem da capa (URL); se não carregar, fica só a cor. */
  imageUrl?: string;
  /** Livro concluído: moldura dourada e faixa "Concluído". */
  completed?: boolean;
  className?: string;
}

/**
 * Capa de livro: degradê da cor escolhida (ou a imagem), lombada, tipo, título
 * e subtítulo. Usada na estante, na página do livro, nos detalhes e no
 * formulário.
 */
export function BookCover({
  title,
  kind,
  subtitle,
  color,
  imageUrl,
  completed = false,
  className,
}: BookCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <div
      role="img"
      aria-label={`Capa do livro ${title}`}
      className={cn(
        "relative isolate flex aspect-[3/4] w-full flex-col rounded-l-sm rounded-r-md bg-linear-to-br text-white shadow-[3px_6px_16px_rgb(0_0_0/0.4)]",
        gradientOf(color),
        completed &&
          "ring-2 ring-amber-400 shadow-[0_0_24px_rgb(251_191_36/0.45)]",
        className,
      )}
    >
      {/* Espessura das páginas, aparecendo atrás da capa (direita e embaixo). */}
      <div
        aria-hidden
        data-slot="page-edge"
        className={cn(
          "absolute top-1 -right-1.5 bottom-1 -z-10 w-1.5 rounded-r-sm bg-linear-to-r",
        )}
      />
      <div
        aria-hidden
        data-slot="page-edge"
        className={cn(
          "absolute right-0 -bottom-1 left-2 -z-10 h-1 rounded-b-sm",
        )}
      />

      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        {showImage && (
          <>
            <img
              src={imageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 size-full object-cover"
              onError={() => setFailedUrl(imageUrl)}
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/30" />
          </>
        )}

        {/* Lombada: sombra da dobra e o vinco perto da borda esquerda. */}
        <div className="absolute inset-y-0 left-0 w-4 bg-linear-to-r from-black/45 via-black/15 to-transparent" />
        <div className="absolute inset-y-0 left-4 w-px bg-white/25" />

        {/* Moldura fina e brilho suave de capa dura. */}
        <div className="absolute inset-y-3 right-3 left-6 rounded-sm border border-white/20" />
        <div className="absolute inset-0 bg-linear-to-br from-white/15 via-transparent to-black/10" />

        {completed && (
          <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-md bg-amber-400 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-amber-950">
            <Trophy className="size-3" /> Concluído
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-between py-6 pr-5 pl-8 text-center">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/80">
          {bookKindLabels[kind]}
        </p>

        <div className="space-y-2">
          <span aria-hidden className="mx-auto block h-px w-8 bg-white/50" />

          <p className="text-lg leading-tight font-bold break-words drop-shadow">
            {title}
          </p>

          {subtitle && (
            <p className="text-xs leading-snug text-white/85">{subtitle}</p>
          )}

          <span aria-hidden className="mx-auto block h-px w-8 bg-white/50" />
        </div>

        <span aria-hidden className="size-1.5 rounded-full bg-white/50" />
      </div>
    </div>
  );
}
