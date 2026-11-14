import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "#ui/button";

import { MarkdownMessage } from "#components/MarkdownMessage";
import { PaperPage } from "#components/PaperPage";

import { chapterElementId } from "../reader";
import type { BookReading } from "../types";

interface BookContentProps {
  modules: BookReading["modules"];
  /** Modo leitura: texto maior e sem o link para abrir a página. */
  reading?: boolean;
  onGoToChapter: (documentId: string) => void;
}

/**
 * Os capítulos do livro em sequência. Cada um é um quadro com cabeçalho (onde
 * começa) e rodapé (onde termina, com o botão para o próximo); o módulo vira
 * um banner acima dos seus capítulos.
 */
export function BookContent({
  modules,
  reading = false,
  onGoToChapter,
}: BookContentProps) {
  // Capítulos na ordem de leitura (para o "Próximo" do fim de cada um).
  const order = modules.flatMap((module) => module.chapters);
  let number = 0;

  return (
    <div className="space-y-16">
      {modules.map((module) => (
        <section key={module.id} className="space-y-10">
          {module.title && (
            <div className="rounded-xl bg-primary/10 px-6 py-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                {module.title}
              </h2>
            </div>
          )}

          {module.chapters.map((chapter) => {
            number += 1;
            const position = number;
            const next = order[position];

            return (
              <section
                key={chapter.documentId}
                id={chapterElementId(chapter.documentId)}
                aria-label={chapter.title}
                className="scroll-mt-20 overflow-hidden rounded-xl border-2 bg-card shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b-2 bg-muted px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Capítulo {position}
                    </p>

                    <p className="truncate text-lg font-semibold">
                      {chapter.title}
                    </p>
                  </div>

                  {!reading && (
                    <Link
                      to={`/library/${chapter.documentId}`}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Abrir página
                    </Link>
                  )}
                </header>

                <PaperPage className="max-w-none rounded-none border-0 bg-transparent shadow-none">
                  <MarkdownMessage
                    content={chapter.content}
                    headingIds
                    idPrefix={chapter.documentId}
                    size={reading ? "base" : "sm"}
                  />
                </PaperPage>

                <footer className="flex flex-wrap items-center justify-between gap-2 border-t-2 bg-muted px-6 py-3 text-xs text-muted-foreground">
                  <span>Fim do capítulo {position}</span>

                  {next && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onGoToChapter(next.documentId)}
                    >
                      Próximo: {next.title} <ArrowRight />
                    </Button>
                  )}
                </footer>
              </section>
            );
          })}
        </section>
      ))}
    </div>
  );
}
