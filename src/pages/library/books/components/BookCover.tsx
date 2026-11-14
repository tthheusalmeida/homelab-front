import { useState } from "react";

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
  className,
}: BookCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const showImage = Boolean(imageUrl) && failedUrl !== imageUrl;

  return (
    <div
      role="img"
      aria-label={`Capa do livro ${title}`}
      className={cn(
        "relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-md bg-linear-to-br p-4 pl-6 text-white shadow-md",
        gradientOf(color),
        className,
      )}
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

      <div className="absolute inset-y-0 left-0 w-2.5 bg-black/25" />

      <p className="relative text-[0.65rem] font-semibold uppercase tracking-widest text-white/80">
        {bookKindLabels[kind]}
      </p>

      <div className="relative space-y-1">
        <p className="text-lg leading-tight font-bold break-words">{title}</p>

        {subtitle && (
          <p className="text-xs leading-snug text-white/85">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
