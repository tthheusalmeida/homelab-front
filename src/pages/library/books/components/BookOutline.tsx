import { Check } from "lucide-react";

import { cn } from "#lib/utils";

import type { BookReading } from "../types";

interface BookOutlineProps {
  modules: BookReading["modules"];
  /** Capítulo sendo lido agora (id do documento); fica destacado. */
  activeChapterId?: string;
  /** Capítulos já lidos (id do documento): ganham um visto no sumário. */
  readIds?: string[];
  onSelectChapter: (documentId: string) => void;
  className?: string;
}

/** Sumário do livro: módulos e capítulos numerados, com o capítulo em leitura em destaque. */
export function BookOutline({
  modules,
  activeChapterId,
  readIds = [],
  onSelectChapter,
  className,
}: BookOutlineProps) {
  let chapterNumber = 0;

  return (
    <nav aria-label="Sumário do livro">
      <ul className={cn("space-y-3 overflow-y-auto pr-1", className)}>
        {modules.map((module) => (
          <li key={module.id} className="space-y-1">
            {module.title && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {module.title}
              </p>
            )}

            <ul className="space-y-1">
              {module.chapters.map((chapter) => {
                chapterNumber += 1;
                const active = chapter.documentId === activeChapterId;
                const read = readIds.includes(chapter.documentId);

                return (
                  <li key={chapter.documentId}>
                    <button
                      type="button"
                      aria-current={active ? "location" : undefined}
                      onClick={() => onSelectChapter(chapter.documentId)}
                      className={cn(
                        "flex w-full items-start gap-2 text-left text-sm hover:underline",
                        active
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        {chapterNumber}. {chapter.title}
                      </span>

                      <span
                        data-slot="read-mark"
                        className="flex size-4 shrink-0 items-center justify-center"
                      >
                        {read && (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="sr-only">, lido</span>
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
