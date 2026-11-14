import { Link } from "react-router";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "#ui/button";

import { MarkdownMessage } from "#components/MarkdownMessage";
import { PaperPage } from "#components/PaperPage";
import { ReadingSection } from "#components/ReadingSection";
import { cn } from "#lib/utils";

import { chapterElementId } from "../reader";
import type { BookReading } from "../types";

interface BookContentProps {
  modules: BookReading["modules"];
  /** Modo leitura: texto maior e sem o link para abrir a página. */
  reading?: boolean;
  /** Capítulos já lidos (id do documento). */
  readIds?: string[];
  /** Sem esta função o botão de marcar como lido não aparece. */
  onToggleRead?: (documentId: string, read: boolean) => void;
  onGoToChapter: (documentId: string) => void;
}

/** Divisor sutil de módulo no modo leitura: título pequeno entre dois filetes. */
function ModuleDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden className="h-px flex-1 bg-border" />

      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {title}
      </h2>

      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * Os capítulos do livro em sequência. Cada um é um quadro com cabeçalho (onde
 * começa) e rodapé (onde termina, com o botão para o próximo); o módulo vira
 * um banner acima dos seus capítulos. No modo leitura (`reading`) o desenho é o
 * mesmo da página: sem moldura, no fundo da plataforma (`ReadingSection`), com
 * filetes sutis entre capítulos e módulos e a marcação de lido discreta.
 */
export function BookContent({
  modules,
  reading = false,
  readIds = [],
  onToggleRead,
  onGoToChapter,
}: BookContentProps) {
  // Capítulos na ordem de leitura (para o "Próximo" do fim de cada um).
  const order = modules.flatMap((module) => module.chapters);
  let number = 0;

  if (reading) {
    return (
      <div className="space-y-14">
        {modules.map((module) => (
          <div key={module.id} className="space-y-14">
            {module.title && <ModuleDivider title={module.title} />}

            {module.chapters.map((chapter) => {
              number += 1;
              const position = number;
              const next = order[position];
              const read = readIds.includes(chapter.documentId);

              return (
                <div
                  key={chapter.documentId}
                  // Separação sutil: um filete entre capítulos (não antes do primeiro).
                  className={cn(
                    position > 1 &&
                      !(module.chapters[0] === chapter && module.title) &&
                      "border-t border-border/60 pt-14",
                  )}
                >
                  <ReadingSection
                    id={chapterElementId(chapter.documentId)}
                    headingLevel={2}
                    title={chapter.title}
                    label={
                      <>
                        Capítulo {position}
                        {read && (
                          <Check
                            aria-hidden
                            className="size-3.5 text-emerald-500"
                          />
                        )}
                      </>
                    }
                    footer={
                      <>
                        {onToggleRead && (
                          <Button
                            variant="ghost"
                            size="xs"
                            aria-pressed={read}
                            className={cn(
                              read
                                ? "text-emerald-500 hover:text-emerald-500"
                                : "text-muted-foreground",
                            )}
                            onClick={() =>
                              onToggleRead(chapter.documentId, !read)
                            }
                          >
                            <Check /> {read ? "Lido" : "Marcar como lido"}
                          </Button>
                        )}

                        {next && (
                          <Button
                            variant="ghost"
                            size="xs"
                            className="text-muted-foreground"
                            onClick={() => onGoToChapter(next.documentId)}
                          >
                            Próximo: {next.title} <ArrowRight />
                          </Button>
                        )}
                      </>
                    }
                  >
                    <MarkdownMessage
                      content={chapter.content}
                      headingIds
                      idPrefix={chapter.documentId}
                      size="base"
                    />
                  </ReadingSection>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

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
            const read = readIds.includes(chapter.documentId);

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

                  <Link
                    to={`/library/${chapter.documentId}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Abrir página
                  </Link>
                </header>

                <PaperPage className="max-w-none rounded-none border-0 bg-transparent shadow-none">
                  <MarkdownMessage
                    content={chapter.content}
                    headingIds
                    idPrefix={chapter.documentId}
                    size="sm"
                  />
                </PaperPage>

                <footer className="flex flex-wrap items-center justify-between gap-2 border-t-2 bg-muted px-6 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>Fim do capítulo {position}</span>

                    {onToggleRead && (
                      <Button
                        variant={read ? "default" : "outline"}
                        size="xs"
                        aria-pressed={read}
                        onClick={() => onToggleRead(chapter.documentId, !read)}
                      >
                        <Check /> {read ? "Lido" : "Marcar como lido"}
                      </Button>
                    )}
                  </div>

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
