import { cn } from "#lib/utils";

import type { BookReading } from "../types";

interface BookOutlineProps {
  modules: BookReading["modules"];
  /** Capítulo sendo lido agora (id do documento); fica destacado. */
  activeChapterId?: string;
  onSelectChapter: (documentId: string) => void;
  className?: string;
}

/** Sumário do livro: módulos e capítulos numerados, com o capítulo em leitura em destaque. */
export function BookOutline({
  modules,
  activeChapterId,
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

                return (
                  <li key={chapter.documentId}>
                    <button
                      type="button"
                      aria-current={active ? "location" : undefined}
                      onClick={() => onSelectChapter(chapter.documentId)}
                      className={cn(
                        "w-full text-left text-sm hover:underline",
                        active
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {chapterNumber}. {chapter.title}
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
